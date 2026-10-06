import type { LessonOccurrence } from '@torabarabim/common';
import { describe, expect, it } from 'vitest';

import { calendarEventOf, calendarUtcStamp, googleCalendarHref, lessonCalendarFeedPath, lessonCalendarWebcalUrl, lessonEventFilePath, venueNameOrStreet } from './helpers';

const occurrenceOf = (overrides: Partial<LessonOccurrence> = {}): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-07-14',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  audience: 'mixed',
  rabbi: { id: 'rabbi-1', name: 'אייל עמרמי', honorific: 'rav', slug: 'eyal-amrami' },
  venue: {
    kind: 'place',
    placeId: 'place-1',
    slug: 'beit-knesset',
    name: 'בית הכנסת הגדול',
    street: 'הרצל 5',
    city: 'פתח תקווה',
    citySlug: 'petah-tikva',
    area: 'center',
  },
  ...overrides,
});

describe('calendarEventOf summary', () => {
  it('names the title and the rabbi with the honorific', () => {
    expect(calendarEventOf(occurrenceOf({ title: 'דף יומי' }), 'static').summary).toBe('דף יומי עם הרב אייל עמרמי');
  });

  it('falls back to a generic title when the lesson has none, or only blanks', () => {
    expect(calendarEventOf(occurrenceOf(), 'static').summary).toBe('שיעור עם הרב אייל עמרמי');
    expect(calendarEventOf(occurrenceOf({ title: '  ' }), 'static').summary).toBe('שיעור עם הרב אייל עמרמי');
  });

  it('uses the substitute, never the usual rabbi, when one teaches', () => {
    const substituteRabbi = { id: 'rabbi-2', name: 'שרה גולדברג', honorific: 'rabbanit' as const, slug: 'sara' };
    expect(calendarEventOf(occurrenceOf({ substituteRabbi }), 'static').summary).toBe('שיעור עם הרבנית שרה גולדברג');
  });

  it('adds the audience only when it is not both', () => {
    expect(calendarEventOf(occurrenceOf({ audience: 'women' }), 'static').summary).toBe('שיעור עם הרב אייל עמרמי, לנשים');
    expect(calendarEventOf(occurrenceOf({ audience: 'men' }), 'static').summary).toBe('שיעור עם הרב אייל עמרמי, לגברים');
    expect(calendarEventOf(occurrenceOf({ audience: 'mixed' }), 'static').summary).not.toContain('ל');
  });

  it('prefixes a cancelled date and marks the event cancelled', () => {
    const event = calendarEventOf(occurrenceOf({ status: 'cancelled' }), 'feed');
    expect(event.summary).toBe('מבוטל: שיעור עם הרב אייל עמרמי');
    expect(event.isCancelled).toBe(true);
    expect(calendarEventOf(occurrenceOf(), 'feed').isCancelled).toBe(false);
  });
});

describe('calendarEventOf description', () => {
  it('carries the disclaimer on the static event only', () => {
    expect(calendarEventOf(occurrenceOf(), 'static').description).toContain('שינויים בשיעור לא מתעדכנים ביומן');
    expect(calendarEventOf(occurrenceOf(), 'feed').description).not.toContain('שינויים בשיעור לא מתעדכנים ביומן');
  });

  it('tags the lesson link and the site link by surface', () => {
    const staticEvent = calendarEventOf(occurrenceOf(), 'static');
    expect(staticEvent.url).toBe('https://torahbarabim.com/lesson/lesson-1/2026-07-14?utm_source=calendar&utm_medium=event');
    expect(staticEvent.description).toContain(`פרטים ועדכונים: ${staticEvent.url}`);
    expect(staticEvent.description).toContain('תורה ברבים: https://torahbarabim.com/?utm_source=calendar&utm_medium=event');

    const feedEvent = calendarEventOf(occurrenceOf(), 'feed');
    expect(feedEvent.url).toContain('utm_medium=feed');
    expect(feedEvent.description).toContain('https://torahbarabim.com/?utm_source=calendar&utm_medium=feed');
  });

  it('lists audience, topic and note only when they exist', () => {
    const plain = calendarEventOf(occurrenceOf(), 'feed').description;
    expect(plain).not.toContain('קהל:');
    expect(plain).not.toContain('נושא:');

    const full = calendarEventOf(occurrenceOf({ audience: 'women', topic: 'halacha', note: 'כניסה מהחצר' }), 'feed').description;
    expect(full).toContain('קהל: נשים');
    expect(full).toContain('נושא: הלכה');
    expect(full).toContain('כניסה מהחצר');
  });
});

describe('calendarEventOf location', () => {
  it('names the venue, its street and its city', () => {
    expect(calendarEventOf(occurrenceOf(), 'static').location).toBe('בית הכנסת הגדול, הרצל 5, פתח תקווה');
  });

  it('uses a hand-typed venue address, without repeating a name that is its street', () => {
    const venue = { kind: 'address' as const, name: 'הרצל 5', street: 'הרצל 5', city: 'פתח תקווה', citySlug: 'petah-tikva', area: 'center' as const };
    expect(calendarEventOf(occurrenceOf({ venue }), 'static').location).toBe('הרצל 5, פתח תקווה');
  });

  it('stands the street in for a blank venue name', () => {
    const venue = { kind: 'address' as const, name: ' ', street: 'הרצל 5', city: 'פתח תקווה', citySlug: 'petah-tikva', area: 'center' as const };
    expect(calendarEventOf(occurrenceOf({ venue }), 'static').location).toBe('הרצל 5, פתח תקווה');
    expect(venueNameOrStreet(venue)).toBe('הרצל 5');
  });
});

describe('calendarEventOf times', () => {
  it('converts a summer 20:30 lesson to 17:30Z and a winter one to 18:30Z', () => {
    expect(calendarEventOf(occurrenceOf({ date: '2026-07-14' }), 'feed').startUtc.toISOString()).toBe('2026-07-14T17:30:00.000Z');
    expect(calendarEventOf(occurrenceOf({ date: '2026-01-13' }), 'feed').startUtc.toISOString()).toBe('2026-01-13T18:30:00.000Z');
  });

  it('follows the clock change across 25 October 2026', () => {
    expect(calendarEventOf(occurrenceOf({ date: '2026-10-20' }), 'feed').startUtc.toISOString()).toBe('2026-10-20T17:30:00.000Z');
    expect(calendarEventOf(occurrenceOf({ date: '2026-10-27' }), 'feed').startUtc.toISOString()).toBe('2026-10-27T18:30:00.000Z');
  });

  it('rolls the end to the next day when it is not after the start', () => {
    const pastMidnight = calendarEventOf(occurrenceOf({ startTime: '23:30', endTime: '00:30' }), 'feed');
    expect(pastMidnight.endUtc.toISOString()).toBe('2026-07-14T21:30:00.000Z');
    expect(pastMidnight.endUtc.getTime()).toBeGreaterThan(pastMidnight.startUtc.getTime());

    const sameTime = calendarEventOf(occurrenceOf({ startTime: '20:30', endTime: '20:30' }), 'feed');
    expect(sameTime.endUtc.getTime() - sameTime.startUtc.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it('keeps the end on the same day when it is after the start', () => {
    const event = calendarEventOf(occurrenceOf(), 'feed');
    expect(event.endUtc.getTime() - event.startUtc.getTime()).toBe(60 * 60 * 1000);
  });
});

describe('calendarEventOf uid', () => {
  it('is the lesson and date, identical for the feed and the one-off add', () => {
    const feed = calendarEventOf(occurrenceOf(), 'feed');
    expect(feed.uid).toBe('lesson-1-2026-07-14@torahbarabim.com');
    expect(calendarEventOf(occurrenceOf(), 'static').uid).toBe(feed.uid);
  });

  it('does not change when an exception moves the time or the venue', () => {
    const moved = calendarEventOf(occurrenceOf({ startTime: '19:00', endTime: '20:00' }), 'feed');
    expect(moved.uid).toBe(calendarEventOf(occurrenceOf(), 'feed').uid);
  });
});

describe('calendarUtcStamp', () => {
  it('writes the basic UTC form without milliseconds', () => {
    expect(calendarUtcStamp(new Date('2026-07-14T17:30:00.000Z'))).toBe('20260714T173000Z');
  });
});

describe('googleCalendarHref', () => {
  const href = googleCalendarHref(calendarEventOf(occurrenceOf({ title: 'דף יומי', note: 'שורה 1\nשורה 2 & עוד' }), 'static'));
  const params = new URL(href).searchParams;

  it('targets the Google Calendar template with the event dates in UTC', () => {
    expect(href.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE&')).toBe(true);
    expect(params.get('dates')).toBe('20260714T173000Z/20260714T183000Z');
  });

  it('percent-encodes Hebrew, newlines and ampersands so each survives as one parameter', () => {
    expect(href).not.toMatch(/[֐-׿\n ]/);
    expect(params.get('text')).toBe('דף יומי עם הרב אייל עמרמי');
    expect(params.get('details')).toContain('שורה 1\nשורה 2 & עוד');
    expect(params.get('location')).toBe('בית הכנסת הגדול, הרצל 5, פתח תקווה');
  });
});

describe('calendar paths', () => {
  it('builds the feed, its webcal form and the one-off file path', () => {
    expect(lessonCalendarFeedPath('lesson-1')).toBe('/lesson/lesson-1/calendar.ics');
    expect(lessonCalendarWebcalUrl('lesson-1')).toBe('webcal://torahbarabim.com/lesson/lesson-1/calendar.ics');
    expect(lessonEventFilePath({ lessonId: 'lesson-1', date: '2026-07-14' })).toBe('/lesson/lesson-1/2026-07-14/event.ics');
  });
});
