export interface ObjectStorage {
  put: (key: string, bytes: Buffer, contentType: string) => Promise<string>;
  remove: (key: string) => Promise<void>;
}
