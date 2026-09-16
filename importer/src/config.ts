import { z } from 'zod';

import type { ImporterConfig } from './models';

const envSchema = z.object({
  IMPORT_API_BASE_URL: z.url(),
  IMPORT_AGENT_KEY: z.string().min(32),
});

const isLocalhost = (url: URL): boolean => url.hostname === 'localhost' || url.hostname === '127.0.0.1';

// Fail at boot, not at first request: a missing or malformed env var, or a
// non-https base URL pointed at anything but localhost, is a startup
// failure. The key itself is never logged, only read into memory.
export const loadConfig = (env: NodeJS.ProcessEnv): ImporterConfig => {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid importer configuration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const url = new URL(parsed.data.IMPORT_API_BASE_URL);
  if (url.protocol !== 'https:' && !isLocalhost(url)) {
    throw new Error(`IMPORT_API_BASE_URL must be https, or localhost for local dev; got '${url.protocol}//${url.hostname}'`);
  }

  return { apiBaseUrl: parsed.data.IMPORT_API_BASE_URL.replace(/\/+$/, ''), agentKey: parsed.data.IMPORT_AGENT_KEY };
};
