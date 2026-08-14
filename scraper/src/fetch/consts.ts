// Status codes worth retrying: rate limited or a transient server failure.
// A 4xx other than 429 means the request itself is wrong and retrying it
// would just repeat the same failure.
export const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
