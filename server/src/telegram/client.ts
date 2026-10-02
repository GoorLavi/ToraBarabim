import { TELEGRAM_API_ORIGIN, TELEGRAM_TIMEOUT_MS } from './consts';
import type { TelegramClient, TelegramCredentials } from './models';

const readDescription = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null || !('description' in body)) return undefined;
  return typeof body.description === 'string' ? body.description : undefined;
};

// Every thrown message here is built from a status, an error name or
// Telegram's own `description`, never from the request or the caught error:
// the bot token is part of the request URL, and an error that echoed the URL
// would put it in the logs.
export const createTelegramClient = (credentials: TelegramCredentials | undefined): TelegramClient => ({
  sendMessage: async (text) => {
    if (!credentials) return 'skipped';

    let response: Response;
    try {
      response = await fetch(`${TELEGRAM_API_ORIGIN}/bot${credentials.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // No parse_mode, so a visitor's text is never read as markup.
        body: JSON.stringify({ chat_id: credentials.chatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'unknown error';
      throw new Error(`Telegram sendMessage request failed before a response: ${errorName}`);
    }

    if (!response.ok) {
      // The body only adds detail; an unreadable one must not hide the status.
      const body: unknown = await response.json().catch(() => undefined);
      const description = readDescription(body) ?? 'no description';
      throw new Error(`Telegram sendMessage failed with status ${response.status}: ${description}`);
    }

    // Unread, the body would hold the socket until it is garbage collected.
    // The alert has been delivered by now, so a failed cancel is not a failed
    // send: it is swallowed here on purpose, and it cannot carry the URL.
    await response.body?.cancel().catch(() => undefined);
    return 'sent';
  },
});
