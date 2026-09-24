import { CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { loadConfig } from '../config';
import { s3Client } from './client';
import type { ObjectStorage } from './models';

const publicUrl: ObjectStorage['publicUrl'] = (key) => {
  const config = loadConfig(process.env);
  return `${config.storagePublicBaseUrl}/${key}`;
};

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
  return publicUrl(key);
};

const remove: ObjectStorage['remove'] = async (key) => {
  const config = loadConfig(process.env);
  await s3Client.send(new DeleteObjectCommand({ Bucket: config.storageBucket, Key: key }));
};

const copy: ObjectStorage['copy'] = async (sourceKey, destinationKey) => {
  const config = loadConfig(process.env);
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: config.storageBucket,
      CopySource: `${config.storageBucket}/${sourceKey}`,
      Key: destinationKey,
    }),
  );
};

const storage: ObjectStorage = { put, remove, publicUrl, copy };

export default storage;
