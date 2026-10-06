import type { LessonOccurrence } from '@torabarabim/common';
import { describe, expect, it } from 'vitest';

import { addOneEventLink, calendarPlatformOf, subscribeToLessonLink } from './helpers';

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

describe('addOneEventLink', () => {
  it('hands an iPhone or a desktop the event file in place', () => {
    expect(addOneEventLink(occurrence, 'other')).toEqual({ href: '/lesson/lesson-1/2026-10-13/event.ics', target: 'ics', opensInNewTab: false });
  });

  it('hands Android a prefilled Google Calendar event in a new tab', () => {
    const link = addOneEventLink(occurrence, 'android');
    expect(link.target).toBe('google');
    expect(link.opensInNewTab).toBe(true);
    expect(link.href.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE&')).toBe(true);
  });
});

describe('subscribeToLessonLink', () => {
  it('hands an iPhone or a desktop the webcal feed in place', () => {
    expect(subscribeToLessonLink('lesson-1', 'other')).toEqual({ href: 'webcal://torahbarabim.com/lesson/lesson-1/calendar.ics', target: 'webcal', opensInNewTab: false });
  });

  it('hands Android Google\'s subscribe link in a new tab', () => {
    expect(subscribeToLessonLink('lesson-1', 'android')).toEqual({
      href: 'https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Ftorahbarabim.com%2Flesson%2Flesson-1%2Fcalendar.ics',
      target: 'google',
      opensInNewTab: true,
    });
  });
});
