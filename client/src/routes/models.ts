import type { CalendarEvent } from '../lessonCalendar/models';

// A JSON-LD value, matching the shape React Router's own `"script:ld+json"`
// meta descriptor accepts (its `LdJsonObject`/`LdJsonValue` are internal to
// the library and not exported), so every route building structured data
// shares this instead of retyping an equivalent shape per file.
// These objects reach the page through React Router's meta descriptor, which
// serializes them and escapes `<`, `>` and `&` into their \uXXXX JSON forms
// before writing the script tag. That is what stops a `</script>` typed into
// a lesson note or a rabbi's bio from closing the tag and running as markup.
// The protection is the library's, not ours, so rendering this JSON into a
// script tag by hand would silently remove it.
export type JsonLdValue = string | number | boolean | null | JsonLdValue[] | JsonLdObject;
export type JsonLdObject = { [key: string]: JsonLdValue };

// One event as the calendar serializer (ics.server.ts) writes it.
// `stampedAt` is the event's DTSTAMP. `revisedAt` is present only for an
// event whose revision calendar apps track (the subscribed feed): it adds
// LAST-MODIFIED and SEQUENCE, so a change counts as a newer version of the
// event and a one-off file, which is never revised, carries neither.
export interface IcsEntry {
  event: CalendarEvent;
  stampedAt: Date;
  revisedAt?: Date;
}

// What only a subscribed feed says about itself: its display name and how
// often a client may poll.
export interface IcsFeedHeader {
  name: string;
  refreshIntervalHours: number;
}
