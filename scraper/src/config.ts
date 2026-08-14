import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  SCRAPER_USER_AGENT: z
    .string()
    .min(1)
    .default('ToraBarabimScraper/0.1 (+https://torabarabim.co.il; scraper@torabarabim.co.il)'),
  SCRAPER_REQUEST_DELAY_MS: z.coerce.number().int().min(0).default(1000),
  SCRAPER_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  SCRAPER_RETRY_COUNT: z.coerce.number().int().min(0).default(3),
  SCRAPER_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(500),
  // How long a cached page or image is trusted before the fetcher hits the
  // site again. Keeps a burst of local re-runs free while a scheduled weekly
  // run still sees fresh content once the TTL has passed.
  SCRAPER_CACHE_TTL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(6 * 60 * 60 * 1000),
  SCRAPER_CACHE_DIR: z.string().min(1).default('.cache'),
  SCRAPER_OUTPUT_DIR: z.string().min(1).default('output'),
  // Used by the ayal-taarog adapter to read its weekly schedule poster.
  // Optional at this layer, deliberately: an adapter that runs on its own
  // (e.g. `--adapter levmeirisrael`) must not be blocked by a key it never
  // touches. ayal-taarog's adapter checks for it itself before it does any
  // work, so a missing key still fails before a wasted fetch, just scoped
  // to the one adapter that needs it.
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export interface Config {
  databaseUrl: string;
  userAgent: string;
  requestDelayMs: number;
  requestTimeoutMs: number;
  retryCount: number;
  retryBaseDelayMs: number;
  cacheTtlMs: number;
  cacheDir: string;
  outputDir: string;
  anthropicApiKey?: string;
}

export const loadConfig = (env: NodeJS.ProcessEnv): Config => {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Invalid scraper configuration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }

  return {
    databaseUrl: parsed.data.DATABASE_URL,
    userAgent: parsed.data.SCRAPER_USER_AGENT,
    requestDelayMs: parsed.data.SCRAPER_REQUEST_DELAY_MS,
    requestTimeoutMs: parsed.data.SCRAPER_REQUEST_TIMEOUT_MS,
    retryCount: parsed.data.SCRAPER_RETRY_COUNT,
    retryBaseDelayMs: parsed.data.SCRAPER_RETRY_BASE_DELAY_MS,
    cacheTtlMs: parsed.data.SCRAPER_CACHE_TTL_MS,
    cacheDir: parsed.data.SCRAPER_CACHE_DIR,
    outputDir: parsed.data.SCRAPER_OUTPUT_DIR,
    anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
  };
};
