import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface CacheEntry {
  url: string;
  fetchedAt: string; // ISO datetime
  bodyBase64: string;
}

const cacheFileFor = (cacheDir: string, url: string): string => {
  const hash = createHash('sha256').update(url).digest('hex');
  return join(cacheDir, `${hash}.json`);
};

export const readCache = async (cacheDir: string, url: string, ttlMs: number): Promise<Buffer | undefined> => {
  const filePath = cacheFileFor(cacheDir, url);
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }

  const entry = JSON.parse(raw) as CacheEntry;
  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  if (age > ttlMs) return undefined;
  return Buffer.from(entry.bodyBase64, 'base64');
};

export const writeCache = async (cacheDir: string, url: string, body: Buffer): Promise<void> => {
  await mkdir(cacheDir, { recursive: true });
  const entry: CacheEntry = {
    url,
    fetchedAt: new Date().toISOString(),
    bodyBase64: body.toString('base64'),
  };
  await writeFile(cacheFileFor(cacheDir, url), JSON.stringify(entry), 'utf-8');
};
