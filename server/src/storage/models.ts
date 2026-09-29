export interface ObjectStorage {
  put: (key: string, bytes: Buffer, contentType: string) => Promise<string>;
  remove: (key: string) => Promise<void>;
  // The public URL for a key already in storage, with no request against
  // the store: every caller that already knows its own key (a course, whose
  // rows store the key rather than the URL) builds its own display URL
  // through this, rather than each re-deriving `storagePublicBaseUrl` by hand.
  publicUrl: (key: string) => string;
  // Server-side copy, for duplicating a course's photos into fresh objects
  // under the new course's own prefix without round-tripping the bytes
  // through this process.
  copy: (sourceKey: string, destinationKey: string) => Promise<void>;
}
