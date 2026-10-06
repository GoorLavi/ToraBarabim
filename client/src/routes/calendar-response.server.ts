import { createHash } from 'node:crypto';

import { CALENDAR_CACHE_HEADERS } from './consts';

// Shared by the feed and the single-event routes, the second caller that
// earned it a file of its own.

const ICS_CONTENT_TYPE = 'text/calendar; charset=utf-8';

const etagOf = (body: string): string => `"${createHash('sha256').update(body).digest('base64url').slice(0, 32)}"`;

// A weak comparison, which is all a 304 needs (RFC 9110 13.1.2): a `W/`
// prefix a proxy added in between must not turn a match into a miss.
const matchesIfNoneMatch = (ifNoneMatch: string | null, etag: string): boolean => {
  if (ifNoneMatch === null) return false;
  return ifNoneMatch
    .split(',')
    .map((candidate) => candidate.trim().replace(/^W\//, ''))
    .some((candidate) => candidate === '*' || candidate === etag);
};

// The body is byte-stable while the data is unchanged (see ics.consts.ts's
// SEQUENCE note), which is what lets the ETag answer a repeat fetch with a
// 304 instead of the whole calendar.
export const calendarResponse = (request: Request, body: string, extraHeaders: Record<string, string> = {}): Response => {
  const etag = etagOf(body);

  if (matchesIfNoneMatch(request.headers.get('if-none-match'), etag)) {
    return new Response(null, { status: 304, headers: { ETag: etag, ...CALENDAR_CACHE_HEADERS } });
  }

  return new Response(body, {
    headers: { 'Content-Type': ICS_CONTENT_TYPE, ETag: etag, ...CALENDAR_CACHE_HEADERS, ...extraHeaders },
  });
};
