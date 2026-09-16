import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

import { formatAlertMessage } from './message';

// This function is deliberately not attached to the VPC (see the comment on
// its construct in server-stack.ts): it must reach api.telegram.org over the
// public internet, which nothing in that VPC can do.

interface SnsRecord {
  Sns: { MessageId: string; Message: string };
}

interface SnsEvent {
  Records: SnsRecord[];
}

interface TelegramCredentials {
  botToken: string;
  chatId: string;
}

const isTelegramCredentials = (value: unknown): value is TelegramCredentials => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.botToken === 'string' && typeof candidate.chatId === 'string';
};

// A caught value is not guaranteed to be an Error (a thrown string or
// object is valid JavaScript), so narrow with a check rather than casting.
// The AWS SDK's own errors carry their useful identity in `name` (e.g.
// AccessDeniedException, ParameterNotFound), while `message` is often empty
// or a generic "UnknownError". Never touches the parameter value or a
// response body. Every branch must still return something identifying: a
// bare name-plus-colon with nothing after it is exactly as useless as the
// empty string this replaced.
const describeError = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error);
  const hasUsefulName = Boolean(error.name) && error.name !== 'Error';
  const hasMessage = Boolean(error.message) && error.message !== error.name;
  if (hasUsefulName && hasMessage) return `${error.name}: ${error.message}`;
  if (hasUsefulName) return error.name;
  if (hasMessage) return error.message;
  return error.name || 'Error with no name or message';
};

const ssmClient = new SSMClient({});

// Cached across warm invocations so a busy alert period does not re-read the
// parameter on every SNS delivery; only ever holds the decrypted value in
// memory, never logged and never written back anywhere.
let cachedCredentials: TelegramCredentials | undefined;

const readTelegramCredentials = async (): Promise<TelegramCredentials> => {
  if (cachedCredentials) return cachedCredentials;

  const parameterName = process.env.TELEGRAM_BOT_TOKEN_PARAM_NAME;
  if (!parameterName) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN_PARAM_NAME environment variable');
  }

  let parameterValue: string | undefined;
  try {
    const response = await ssmClient.send(new GetParameterCommand({ Name: parameterName, WithDecryption: true }));
    parameterValue = response.Parameter?.Value;
  } catch (error) {
    throw new Error(`Failed to read SSM parameter ${parameterName}: ${describeError(error)}`, { cause: error });
  }
  if (!parameterValue) {
    throw new Error(`SSM parameter ${parameterName} exists but carries no value`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(parameterValue);
  } catch (error) {
    // Never include parameterValue or the parse error's own message here:
    // both can carry the bot token, which is exactly the value this
    // function must never log.
    throw new Error(`SSM parameter ${parameterName} does not contain valid JSON`, { cause: error });
  }
  if (!isTelegramCredentials(parsed)) {
    throw new Error(`SSM parameter ${parameterName} does not contain both botToken and chatId`);
  }

  cachedCredentials = parsed;
  return cachedCredentials;
};

const sendTelegramMessage = async (credentials: TelegramCredentials, text: string, messageId: string): Promise<void> => {
  const response = await fetch(`https://api.telegram.org/bot${credentials.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: credentials.chatId, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed with status ${response.status} for SNS message ${messageId}: ${body}`);
  }
};

export const handler = async (event: SnsEvent): Promise<void> => {
  const credentials = await readTelegramCredentials();

  for (const record of event.Records) {
    const text = formatAlertMessage(record.Sns.Message);
    await sendTelegramMessage(credentials, text, record.Sns.MessageId);
  }
};
