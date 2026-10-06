// Apart from routes/consts.ts on purpose: that file imports page code, and
// ics.server.ts is imported by a Node test that resolves only what it must.

export const ICS_LINE_BREAK = '\r\n';

// RFC 5545 3.1: a content line is folded at 75 octets, and every
// continuation line spends one of its octets on the leading space.
export const ICS_MAX_LINE_OCTETS = 75;
export const ICS_CONTINUATION_MAX_CONTENT_OCTETS = ICS_MAX_LINE_OCTETS - 1;

export const ICS_PRODUCT_ID = '-//ToraBarabim//Lesson calendar//HE';

// SEQUENCE counts whole minutes since this instant. RFC 5545 wants a
// revision number that only goes up, and a lesson's last-update time is the
// only revision signal there is, so the number is derived from it: the same
// data always serializes to the same bytes, and a same-day cancellation is a
// higher number that a calendar app applies over the copy it holds.
export const ICS_SEQUENCE_EPOCH_MS = Date.UTC(2026, 0, 1);
export const MS_PER_MINUTE = 60_000;
