import { RETRYABLE_STATUS_CODES } from './consts';
import { HostQueue } from './host-queue';
import { readCache, writeCache } from './cache';
import type { Fetcher, FetcherOptions } from './models';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: FetcherOptions): Promise<Buffer> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retryCount; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': options.userAgent },
      });

      if (!response.ok) {
        if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === options.retryCount) {
          throw new Error(`Fetching ${url} failed: expected 2xx, got ${response.status}`);
        }
        lastError = new Error(`Fetching ${url} got a transient ${response.status}, retrying`);
      } else {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      lastError = error;
      if (attempt === options.retryCount) throw error;
    } finally {
      clearTimeout(timeout);
    }

    await sleep(options.retryBaseDelayMs * 2 ** attempt);
  }

  // Unreachable: the loop above always returns or throws on the final attempt.
  throw lastError;
};

// Deliberately does not check robots.txt before a request. Politeness here
// is carried entirely by the per-host queue, the delay, and the disk cache
// above: one request at a time, spaced out, and never repeated within the
// cache TTL. This was a conscious, human-approved compromise for this slice,
// not an oversight.
export const createFetcher = (options: FetcherOptions): Fetcher => {
  const queue = new HostQueue(options.requestDelayMs);

  const fetchRaw = async (url: string): Promise<Buffer> => {
    const cached = await readCache(options.cacheDir, url, options.cacheTtlMs);
    if (cached) return cached;

    const host = new URL(url).host;
    const body = await queue.run(host, () => fetchWithRetry(url, options));
    await writeCache(options.cacheDir, url, body);
    return body;
  };

  return {
    fetchText: async (url) => (await fetchRaw(url)).toString('utf-8'),
    fetchBuffer: (url) => fetchRaw(url),
  };
};
