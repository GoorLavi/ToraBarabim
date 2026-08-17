import { S3Client } from '@aws-sdk/client-s3';

import { loadConfig } from '../config';

declare global {
  // eslint-disable-next-line no-var -- required by TS for global augmentation
  var __torabarabimS3: S3Client | undefined;
}

const createClient = (): S3Client => {
  const config = loadConfig(process.env);
  // One code path for MinIO and real S3: an endpoint means MinIO (or any
  // S3-compatible host) and needs path-style addressing; no endpoint lets
  // the SDK resolve the real AWS S3 endpoint for the region.
  //
  // Credentials are only passed explicitly when config supplies both (the
  // MinIO case, enforced by config.ts). Omitting `credentials` here, rather
  // than passing empty strings, is what makes the fallback fail-safe: the
  // SDK's default provider chain then resolves the Fargate task's IAM role,
  // and if no role and no keys exist it throws at request time instead of
  // ever sending a request unauthenticated.
  const credentials =
    config.storageAccessKeyId && config.storageSecretAccessKey
      ? { accessKeyId: config.storageAccessKeyId, secretAccessKey: config.storageSecretAccessKey }
      : undefined;
  return new S3Client({
    region: config.storageRegion,
    endpoint: config.storageEndpoint,
    forcePathStyle: config.storageEndpoint !== undefined,
    credentials,
  });
};

export const s3Client: S3Client =
  process.env.NODE_ENV === 'production' ? createClient() : (globalThis.__torabarabimS3 ??= createClient());
