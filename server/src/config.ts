import { z } from 'zod';

import type { TelegramCredentials } from './telegram/models';

const telegramCredentialsSchema = z.object({
  botToken: z.string().min(1),
  chatId: z.string().min(1),
}) satisfies z.ZodType<TelegramCredentials>;

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  CORS_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  DATABASE_URL: z.url(),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  // Empty/absent means the real AWS S3 endpoint; only set locally to point at MinIO.
  STORAGE_ENDPOINT: z.url().optional().or(z.literal('')),
  STORAGE_REGION: z.string().min(1).default('us-east-1'),
  STORAGE_BUCKET: z.string().min(1),
  // Required for MinIO, which has no notion of an IAM role. Optional for
  // real S3, where the Fargate task's own IAM role authenticates instead,
  // so no long-lived key has to exist for someone to leak.
  STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  STORAGE_PUBLIC_BASE_URL: z.url(),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5_000_000),
  // Absent by default: the agent import routes are only registered when
  // this is set (fail closed, feature off). A present-but-short key fails
  // boot rather than accepting a weak credential silently.
  IMPORT_AGENT_KEY: z.string().min(32).optional(),
  // JSON `{"botToken","chatId"}`, the same shape as the alarm notifier's SSM
  // parameter. Fail-open: absent or blank means the visitor-message alert is
  // off (the form still works and every message is still saved), because
  // Telegram is a convenience and the save is what matters. A present but
  // malformed value fails boot instead, since a typo would otherwise switch
  // alerts off silently. The error names the variable and the missing keys,
  // never the value, which carries the bot token.
  TELEGRAM_CREDENTIALS: z
    .string()
    .optional()
    .transform((raw, ctx): TelegramCredentials | undefined => {
      if (raw === undefined || raw.trim() === '') return undefined;

      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'TELEGRAM_CREDENTIALS must be JSON like {"botToken":"...","chatId":"..."}' });
        return z.NEVER;
      }

      const result = telegramCredentialsSchema.safeParse(json);
      if (!result.success) {
        const badKeys = [...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? 'value')))];
        ctx.addIssue({ code: 'custom', message: `TELEGRAM_CREDENTIALS needs a non-empty botToken and chatId, problem with: ${badKeys.join(', ')}` });
        return z.NEVER;
      }
      return result.data;
    }),
}).refine(
  (data) => !data.STORAGE_ENDPOINT || (data.STORAGE_ACCESS_KEY_ID && data.STORAGE_SECRET_ACCESS_KEY),
  {
    message: 'STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY are required when STORAGE_ENDPOINT is set',
    path: ['STORAGE_ACCESS_KEY_ID'],
  },
);

export interface Config {
  port: number;
  host: string;
  corsOrigins: string[];
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  databaseUrl: string;
  sessionSecret: string;
  sessionTtlHours: number;
  storageEndpoint: string | undefined;
  storageRegion: string;
  storageBucket: string;
  storageAccessKeyId: string | undefined;
  storageSecretAccessKey: string | undefined;
  storagePublicBaseUrl: string;
  maxUploadBytes: number;
  importAgentKey: string | undefined;
  telegram: TelegramCredentials | undefined;
}

export const loadConfig = (env: NodeJS.ProcessEnv): Config => {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server configuration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }

  return {
    port: parsed.data.PORT,
    host: parsed.data.HOST,
    corsOrigins: parsed.data.CORS_ORIGINS,
    logLevel: parsed.data.LOG_LEVEL,
    databaseUrl: parsed.data.DATABASE_URL,
    sessionSecret: parsed.data.SESSION_SECRET,
    sessionTtlHours: parsed.data.SESSION_TTL_HOURS,
    storageEndpoint: parsed.data.STORAGE_ENDPOINT || undefined,
    storageRegion: parsed.data.STORAGE_REGION,
    storageBucket: parsed.data.STORAGE_BUCKET,
    storageAccessKeyId: parsed.data.STORAGE_ACCESS_KEY_ID,
    storageSecretAccessKey: parsed.data.STORAGE_SECRET_ACCESS_KEY,
    storagePublicBaseUrl: parsed.data.STORAGE_PUBLIC_BASE_URL,
    maxUploadBytes: parsed.data.MAX_UPLOAD_BYTES,
    importAgentKey: parsed.data.IMPORT_AGENT_KEY,
    telegram: parsed.data.TELEGRAM_CREDENTIALS,
  };
};
