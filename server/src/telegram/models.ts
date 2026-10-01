export interface TelegramCredentials {
  botToken: string;
  chatId: string;
}

export interface TelegramClient {
  // 'skipped' means no credentials are configured and nothing was sent.
  // Any failure to deliver throws; the caller decides whether that matters.
  sendMessage: (text: string) => Promise<'sent' | 'skipped'>;
}
