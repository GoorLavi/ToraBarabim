// The fetcher an adapter is handed to reach the network. An adapter never
// calls `fetch` directly, so every request goes through the shared rate
// limit, retry, and disk cache regardless of which site it targets.
export interface Fetcher {
  fetchText(url: string): Promise<string>;
  fetchBuffer(url: string): Promise<Buffer>;
}

export interface FetcherOptions {
  userAgent: string;
  requestDelayMs: number;
  requestTimeoutMs: number;
  retryCount: number;
  retryBaseDelayMs: number;
  cacheTtlMs: number;
  cacheDir: string;
}
