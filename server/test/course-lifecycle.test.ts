import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { courseLifecycle } from '../src/service/course/lifecycle';
import { addDays, todayInIsrael } from '../src/service/lesson/israel-time';

// Pure logic, so this suite needs neither a database nor a built client.
// It exists because the closed-week boundary and the manual-close timezone
// conversion are exactly the calculations a bug hides in silently: the
// symptom is a course a week either early or late off the home row.

const OPENING = '2026-11-03';

describe('courseLifecycle', () => {
  test('a non-joinable course: notOpen the day before opening, closed on the opening day itself', () => {
    const course = { openingDate: OPENING, weeks: 10, joinableAfterOpening: false, registrationClosedAt: null, closeReason: null };

    const dayBefore = courseLifecycle(course, addDays(OPENING, -1));
    assert.equal(dayBefore.status, 'notOpen');

    const openingDay = courseLifecycle(course, OPENING);
    assert.equal(openingDay.status, 'closed');
    if (openingDay.status === 'closed') assert.equal(openingDay.reason, 'closed');
  });

  test('a joinable course: open on opening day and on opening + 7N - 1, closed on opening + 7N', () => {
    const weeks = 10;
    const course = { openingDate: OPENING, weeks, joinableAfterOpening: true, registrationClosedAt: null, closeReason: null };

    const openingDay = courseLifecycle(course, OPENING);
    assert.equal(openingDay.status, 'open');

    const lastOpenDay = courseLifecycle(course, addDays(OPENING, 7 * weeks - 1));
    assert.equal(lastOpenDay.status, 'open');

    const closingDay = courseLifecycle(course, addDays(OPENING, 7 * weeks));
    assert.equal(closingDay.status, 'closed');
  });

  test('a manual close converts to the next Israel date, in winter and in summer', () => {
    // Joinable and opened long before the close, so the calendar's own
    // auto-close (opening + 7 * weeks) falls well after these manual
    // closes: the manual date is what actually determines `closedOn` here,
    // which is the only way this test can tell a wrong conversion apart
    // from the calendar close winning regardless.
    //
    // 22:30 UTC in winter (Israel at UTC+2) is already 00:30 the next day in
    // Israel; 21:30 UTC in summer (Israel at UTC+3) is already 00:30 the
    // next day too. Both must resolve to the next calendar date, not the
    // UTC one, or the whole closed week shifts by a day.
    const winterClose = new Date('2026-01-15T22:30:00.000Z');
    const winterCourse = { openingDate: '2020-01-01', weeks: 500, joinableAfterOpening: true, registrationClosedAt: winterClose, closeReason: 'closed' as const };
    const winterToday = todayInIsrael(winterClose);
    assert.equal(winterToday, '2026-01-16');
    const winterResult = courseLifecycle(winterCourse, winterToday);
    assert.equal(winterResult.status, 'closed');
    if (winterResult.status === 'closed') assert.equal(winterResult.closedOn, '2026-01-16');

    const summerClose = new Date('2026-07-15T21:30:00.000Z');
    const summerCourse = { openingDate: '2020-01-01', weeks: 500, joinableAfterOpening: true, registrationClosedAt: summerClose, closeReason: 'closed' as const };
    const summerToday = todayInIsrael(summerClose);
    assert.equal(summerToday, '2026-07-16');
    const summerResult = courseLifecycle(summerCourse, summerToday);
    assert.equal(summerResult.status, 'closed');
    if (summerResult.status === 'closed') assert.equal(summerResult.closedOn, '2026-07-16');
  });

  test('the closed week: listed through closedOn + 6, gone on closedOn + 7, leavesListsOn equals closedOn + 7', () => {
    const course = { openingDate: OPENING, weeks: 10, joinableAfterOpening: false, registrationClosedAt: null, closeReason: null };
    const closedOn = OPENING;

    const stillListed = courseLifecycle(course, addDays(closedOn, 6));
    assert.equal(stillListed.status, 'closed');
    assert.equal(stillListed.isListed, true);
    assert.equal(stillListed.leavesListsOn, addDays(closedOn, 7));

    const gone = courseLifecycle(course, addDays(closedOn, 7));
    assert.equal(gone.status, 'closed');
    assert.equal(gone.isListed, false);
    assert.equal(gone.leavesListsOn, addDays(closedOn, 7));
  });
});
