import type { LessonOccurrenceDetail } from '@torabarabim/common';
import { describe, expect, it } from 'vitest';

import { lessonActionsOf, lessonReportContextLines, lessonShareText, lessonShareUrl, occurrenceWhenLabel, weeklyScheduleLabel } from './helpers';

const RLM = '‏';

const detailOf = (overrides: Partial<LessonOccurrenceDetail> = {}): LessonOccurrenceDetail => ({
  lessonId: 'lesson-1',
  date: '2026-10-13',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  audience: 'mixed',
  rabbi: { id: 'rabbi-1', name: 'אייל עמרמי', honorific: 'rav', slug: 'eyal-amrami' },
  venue: { kind: 'place', placeId: 'place-1', slug: 'beit-knesset', name: 'בית הכנסת הגדול', street: 'הרצל 5', city: 'פתח תקווה', citySlug: 'petah-tikva', area: 'center' },
  timing: 'upcoming',
  schedule: { kind: 'once' },
  calendarOccurrence: null,
  ...overrides,
});

const weekly = (weekdays: Extract<LessonOccurrenceDetail['schedule'], { kind: 'weekly' }>['weekdays']): LessonOccurrenceDetail['schedule'] => ({ kind: 'weekly', weekdays, startTime: '20:30' });

describe('weeklyScheduleLabel', () => {
  it('names one weekday as "כל יום ..."', () => {
    expect(weeklyScheduleLabel({ kind: 'weekly', weekdays: [2], startTime: '20:30' })).toBe('כל יום שלישי בשעה 20:30');
  });

  it('never writes "יום שבת" for a single Saturday', () => {
    expect(weeklyScheduleLabel({ kind: 'weekly', weekdays: [6], startTime: '08:00' })).toBe('כל שבת בשעה 08:00');
  });

  it('joins two weekdays with a vav', () => {
    expect(weeklyScheduleLabel({ kind: 'weekly', weekdays: [1, 3], startTime: '20:30' })).toBe('בימי שני ורביעי בשעה 20:30');
  });

  it('joins three with commas and a final vav', () => {
    expect(weeklyScheduleLabel({ kind: 'weekly', weekdays: [0, 2, 4], startTime: '20:30' })).toBe('בימי ראשון, שלישי וחמישי בשעה 20:30');
  });
});

describe('occurrenceWhenLabel', () => {
  it('names the weekday, day, month and time', () => {
    expect(occurrenceWhenLabel({ date: '2026-10-13', startTime: '20:30' })).toBe('יום שלישי, 13 באוקטובר, בשעה 20:30');
  });
});

describe('lessonShareText', () => {
  it('opens a one-time lesson with a right-to-left mark, then the date, then the venue and city', () => {
    const lines = lessonShareText(detailOf()).split('\n');
    expect(lines).toEqual([`${RLM}שיעור עם הרב אייל עמרמי`, 'יום שלישי, 13 באוקטובר, בשעה 20:30', 'בית הכנסת הגדול, פתח תקווה']);
  });

  it('never carries the link: native share adds it, a copy is the link alone', () => {
    expect(lessonShareText(detailOf())).not.toContain('torahbarabim');
  });

  it('names the substitute for a one-time lesson but the lesson\'s own rabbi for a weekly one', () => {
    const substituteRabbi = { id: 'rabbi-2', name: 'שרה גולדברג', honorific: 'rabbanit' as const, slug: 'sara' };
    expect(lessonShareText(detailOf({ substituteRabbi })).split('\n')[0]).toBe(`${RLM}שיעור עם הרבנית שרה גולדברג`);
    expect(lessonShareText(detailOf({ substituteRabbi, schedule: weekly([2]) })).split('\n')[0]).toBe(`${RLM}שיעור עם הרב אייל עמרמי`);
  });

  it('gives a weekly lesson its pattern and never a date', () => {
    const text = lessonShareText(detailOf({ schedule: weekly([2]) }));
    expect(text.split('\n')[1]).toBe('כל יום שלישי בשעה 20:30');
    expect(text).not.toContain('באוקטובר');
  });

  it('adds the audience only when it is not both', () => {
    expect(lessonShareText(detailOf({ audience: 'women', title: 'הלכות שבת' })).split('\n')[0]).toBe(`${RLM}הלכות שבת עם הרב אייל עמרמי, לנשים`);
    expect(lessonShareText(detailOf({ audience: 'men' })).split('\n')[0]).toBe(`${RLM}שיעור עם הרב אייל עמרמי, לגברים`);
  });

  it('puts no ב before the venue and stands the street in for a blank hand-typed name', () => {
    const venue = { kind: 'address' as const, name: ' ', street: 'הרצל 5', city: 'פתח תקווה', citySlug: 'petah-tikva', area: 'center' as const };
    expect(lessonShareText(detailOf({ venue })).split('\n')[2]).toBe('הרצל 5, פתח תקווה');
    expect(lessonShareText(detailOf()).split('\n')[2]).toBe('בית הכנסת הגדול, פתח תקווה');
  });
});

describe('lessonShareUrl', () => {
  it('carries the bare shared flag on the lesson link', () => {
    expect(lessonShareUrl(detailOf())).toBe('https://torahbarabim.com/lesson/lesson-1/2026-10-13?s');
  });

  it('points at the calendar date when there is one, so nobody lands on a cancelled date', () => {
    const calendarOccurrence = { ...detailOf(), date: '2026-10-20' };
    expect(lessonShareUrl(detailOf({ status: 'cancelled', calendarOccurrence }))).toBe('https://torahbarabim.com/lesson/lesson-1/2026-10-20?s');
  });
});

describe('lessonActionsOf', () => {
  it('offers both for an upcoming one-time lesson', () => {
    expect(lessonActionsOf(detailOf({ calendarOccurrence: detailOf() }))).toEqual({ canShare: true, canAddToCalendar: true });
  });

  it('offers neither for a one-time lesson that is cancelled or gone', () => {
    expect(lessonActionsOf(detailOf())).toEqual({ canShare: false, canAddToCalendar: false });
  });

  it('keeps the share for a weekly lesson with no date left to add', () => {
    expect(lessonActionsOf(detailOf({ schedule: weekly([2]) }))).toEqual({ canShare: true, canAddToCalendar: false });
  });
});

describe('lessonReportContextLines', () => {
  it('is the lesson, when, and where, one to a line', () => {
    expect(lessonReportContextLines(detailOf({ title: 'דף יומי' }))).toEqual([
      'דף יומי עם הרב אייל עמרמי',
      'יום שלישי, 13 באוקטובר, בשעה 20:30',
      'בית הכנסת הגדול, פתח תקווה',
    ]);
  });
});
