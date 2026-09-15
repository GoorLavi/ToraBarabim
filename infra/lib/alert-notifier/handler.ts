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
    throw new Error(`Failed to read SSM parameter ${parameterName}: ${(error as Error).message}`, { cause: error });
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
