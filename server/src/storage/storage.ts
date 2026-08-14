import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { loadConfig } from '../config';
import { s3Client } from './client';
import type { ObjectStorage } from './models';

const put: ObjectStorage['put'] = async (key, bytes, contentType) => {
  const config = loadConfig(process.env);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.storageBucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  );
  return `${config.storagePublicBaseUrl}/${key}`;
};

const remove: ObjectStorage['remove'] = async (key) => {
  const config = loadConfig(process.env);
  await s3Client.send(new DeleteObjectCommand({ Bucket: config.storageBucket, Key: key }));
};

const storage: ObjectStorage = { put, remove };

export default storage;
