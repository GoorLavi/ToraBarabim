import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { placeCourseRow } from '../src/service/home/home-rows';
import type { CourseSummaryRecord } from '../src/service/course/models';
import type { LessonHomeRowResult } from '../src/service/home/models';

// Pure, so "no listed course gives no row" can be proven for real rather
// than by relying on the courses table being empty. `service/home/home.ts`
// calls this with its live `lessonRows` and `courseItems`; this suite gives
// it fixtures instead.

const lessonRow = (id: LessonHomeRowResult['id']): LessonHomeRowResult => ({ kind: 'lessons', id, title: id, items: [] });

const course: CourseSummaryRecord = {
  id: 'course-1',
  slug: 'course-1',
  name: 'קורס לדוגמה',
  coverKey: 'courses/course-1/cover.png',
  openingDate: '2026-01-01',
  teacher: { kind: 'named', name: 'מורה לדוגמה' },
  venue: { kind: 'address', name: 'בית מדרש', street: 'רחוב הרצל 1', city: 'ירושלים', citySlug: 'ירושלים', area: 'center' },
  audience: 'mixed',
  lifecycle: { status: 'notOpen', closesOn: '2026-01-01', isListed: true, leavesListsOn: '2026-01-08' },
};

describe('placeCourseRow', () => {
  test('no listed courses gives no course row', () => {
    const lessonRows = [lessonRow('today'), lessonRow('weekly')];

    const rows = placeCourseRow(lessonRows, []);

    assert.deepEqual(rows, lessonRows);
  });

  test('one listed course lands right after the first lesson row', () => {
    const lessonRows = [lessonRow('today'), lessonRow('weekly')];

    const rows = placeCourseRow(lessonRows, [course]);

    assert.equal(rows.length, 3);
    assert.deepEqual(
      rows.map((row) => row.id),
      ['today', 'courses', 'weekly'],
    );
    const courseRow = rows[1];
    assert.equal(courseRow?.kind, 'courses');
    if (courseRow?.kind === 'courses') assert.deepEqual(courseRow.items, [course]);
  });

  test('one listed course with no lesson rows lands at index 0', () => {
    const rows = placeCourseRow([], [course]);

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.kind, 'courses');
  });
});
