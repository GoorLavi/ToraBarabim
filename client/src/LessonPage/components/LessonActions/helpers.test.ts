import type { LessonOccurrence } from '@torabarabim/common';
import { describe, expect, it } from 'vitest';

import { calendarLinkOf, calendarPlatformOf, effectiveCalendarOf, opensInNewTab } from './helpers';

const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DESKTOP_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const occurrence: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-10-13',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  audience: 'mixed',
  rabbi: { id: 'rabbi-1', name: 'אייל עמרמי', honorific: 'rav', slug: 'eyal-amrami' },
  venue: { kind: 'address', name: 'בית הכנסת', street: 'הרצל 5', city: 'פתח תקווה', citySlug: 'petah-tikva', area: 'center' },
};

describe('calendarPlatformOf', () => {
  it('recognises Android and treats every other device, or none, as other', () => {
    expect(calendarPlatformOf(ANDROID_CHROME)).toBe('android');
    expect(calendarPlatformOf(IPHONE_SAFARI)).toBe('other');
    expect(calendarPlatformOf(DESKTOP_CHROME)).toBe('other');
    expect(calendarPlatformOf('')).toBe('other');
  });
});

const GOOGLE_EVENT_PREFIX = 'https://calendar.google.com/calendar/render?action=TEMPLATE&';
const GOOGLE_SUBSCRIBE = 'https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Ftorahbarabim.com%2Flesson%2Flesson-1%2Fcalendar.ics';
const DEVICE_FILE = '/lesson/lesson-1/2026-10-13/event.ics';
const DEVICE_FEED = 'webcal://torahbarabim.com/lesson/lesson-1/calendar.ics';

describe('calendarLinkOf', () => {
  describe.each(['other', 'android'] as const)('one lesson on %s', (platform) => {
    it('opens a prefilled Google event in a new tab for Google', () => {
      const link = calendarLinkOf({ calendar: 'google', scope: 'one', platform, occurrence });
      expect(link.target).toBe('google');
      expect(opensInNewTab(link)).toBe(true);
      expect(link.href.startsWith(GOOGLE_EVENT_PREFIX)).toBe(true);
    });
  });

  describe.each(['other', 'android'] as const)('all lessons on %s', (platform) => {
    it('opens Google\'s subscribe link in a new tab for Google', () => {
      const link = calendarLinkOf({ calendar: 'google', scope: 'all', platform, lessonId: 'lesson-1' });
      expect(link).toEqual({ href: GOOGLE_SUBSCRIBE, target: 'google' });
      expect(opensInNewTab(link)).toBe(true);
    });
  });

  it('hands the device calendar of an iPhone or a desktop the event file in place', () => {
    const link = calendarLinkOf({ calendar: 'device', scope: 'one', platform: 'other', occurrence });
    expect(link).toEqual({ href: DEVICE_FILE, target: 'ics' });
    expect(opensInNewTab(link)).toBe(false);
  });

  it('hands the device calendar of an iPhone or a desktop the webcal feed in place', () => {
    const link = calendarLinkOf({ calendar: 'device', scope: 'all', platform: 'other', lessonId: 'lesson-1' });
    expect(link).toEqual({ href: DEVICE_FEED, target: 'webcal' });
    expect(opensInNewTab(link)).toBe(false);
  });

  it('never offers Android the device file or feed, whatever calendar was passed', () => {
    expect(calendarLinkOf({ calendar: 'device', scope: 'one', platform: 'android', occurrence }).target).toBe('google');
    expect(calendarLinkOf({ calendar: 'device', scope: 'all', platform: 'android', lessonId: 'lesson-1' })).toEqual({ href: GOOGLE_SUBSCRIBE, target: 'google' });
  });
});

describe('effectiveCalendarOf', () => {
  it('keeps the choice off Android and makes it Google on Android', () => {
    expect(effectiveCalendarOf('device', 'other')).toBe('device');
    expect(effectiveCalendarOf('google', 'other')).toBe('google');
    expect(effectiveCalendarOf('device', 'android')).toBe('google');
  });
});

describe('opensInNewTab', () => {
  it('opens only a Google link in a tab of its own', () => {
    expect(opensInNewTab({ href: 'x', target: 'google' })).toBe(true);
    expect(opensInNewTab({ href: 'x', target: 'ics' })).toBe(false);
    expect(opensInNewTab({ href: 'x', target: 'webcal' })).toBe(false);
  });
});
