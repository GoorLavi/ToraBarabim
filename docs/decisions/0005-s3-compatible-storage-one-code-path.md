# 0005: Images use one S3-compatible code path, MinIO locally

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

Every rabbi has a tall portrait poster, so image upload is structural rather than a
nice-to-have. Uploads need somewhere to live in development and somewhere else in
production, and the usual result is two code paths that drift.

## Decision

One storage module talking the S3 protocol, used by both environments. MinIO in Docker
locally, AWS S3 in production. Which one is in play is decided entirely by whether
`STORAGE_ENDPOINT` is set: set means a custom endpoint with path style addressing,
unset means real S3.

Local host ports are 9010 for the API and 9011 for the console, not MinIO's defaults, so
this project never assumes it owns a port another local project may already hold.

## Consequences

- Moving to production changes configuration, not code. The upload path that was
  exercised by hand locally is the same path that runs live.
- The bucket is world readable, because the browser fetches poster images directly from
  it. That is fine for images intended to be public and is wrong for anything else, so
  nothing private may be stored in this bucket.
- Uploaded objects are addressed by a key derived from the public URL, since the schema
  stores the URL rather than a separate key column. If the URL format ever changes, old
  image cleanup silently stops matching and leaks objects rather than breaking requests.
- The expected volume is low, on the order of a thousand images, so storage cost is
  effectively noise.

## Rejected

- **Local disk in development, S3 in production.** Two code paths, and the one that runs
  in production is the one nobody exercised.
- **Cloudflare R2.** Cheaper on egress and genuinely attractive, but the project owner
  is already on AWS and did not want another vendor for a thousand images.
- **Storing images in the database.** Simple until the first backup.
