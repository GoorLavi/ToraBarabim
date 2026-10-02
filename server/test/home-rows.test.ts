import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { HELP_TILE_KINDS, HELP_TILE_MIN_INDEX } from '../src/service/home/consts';
import { placeCourseRow, placeHelpTiles } from '../src/service/home/home-rows';
import type { CourseSummaryRecord } from '../src/service/course/models';
import type { LessonHomeRowResult, ResolvedHomeOccurrence } from '../src/service/home/models';

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

const occurrence = (lessonId: string): ResolvedHomeOccurrence => ({
  lessonId,
  date: '2026-01-01',
  startTime: '19:00',
  endTime: '20:00',
  audience: 'men',
  recurrenceKind: 'weekly',
  rabbi: { id: 'rabbi-1', name: 'רב לדוגמה', honorific: 'rav', slug: 'rabbi-1' },
  cityCode: 1,
  venue: { kind: 'address', name: 'בית כנסת', street: 'רחוב הרצל 1', city: 'ירושלים', citySlug: 'ירושלים', area: 'jerusalem' },
  rabbiProminenceRank: 0,
  shuffleKey: 0,
});

const lessonRowWithItems = (id: LessonHomeRowResult['id'], itemCount: number, womensAreaTileIndex?: number): LessonHomeRowResult => ({
  kind: 'lessons',
  id,
  title: id,
  items: Array.from({ length: itemCount }, (_, index) => occurrence(`${id}-${index}`)),
  womensAreaTileIndex,
});

// The four home rows at their real minimum and maximum lengths, with the
// women's-area tile on the second one, as `getHome` places it.
const fixtureRows = (): LessonHomeRowResult[] => [
  lessonRowWithItems('area', 3),
  lessonRowWithItems('today', 12, 3),
  lessonRowWithItems('bothAudiences', 5),
  lessonRowWithItems('weekly', 3),
];

// A small linear congruential generator: any seed gives a fixed sequence in
// [0, 1), so a failing seed can be replayed.
const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

const SEED_COUNT = 500;

describe('placeHelpTiles', () => {
  test('never uses slot 0 or 1, never shares a row with the women tile, and never repeats a kind', () => {
    for (let seed = 1; seed <= SEED_COUNT; seed += 1) {
      const rows = placeHelpTiles(fixtureRows(), seededRandom(seed));

      const kinds: string[] = [];
      for (const row of rows) {
        if (!row.helpTile) continue;
        kinds.push(row.helpTile.kind);
        assert.ok(row.helpTile.index >= HELP_TILE_MIN_INDEX, `seed ${seed}: row ${row.id} got index ${row.helpTile.index}`);
        assert.ok(row.helpTile.index <= row.items.length, `seed ${seed}: row ${row.id} got index ${row.helpTile.index} of ${row.items.length}`);
        assert.ok(Number.isInteger(row.helpTile.index), `seed ${seed}: row ${row.id} got a non-integer index`);
        assert.equal(row.womensAreaTileIndex, undefined, `seed ${seed}: row ${row.id} carries both tiles`);
      }
      assert.equal(new Set(kinds).size, kinds.length, `seed ${seed}: a kind appears twice: ${kinds.join(',')}`);
    }
  });

  test('the same random sequence gives the same placement, and different sequences differ', () => {
    const first = placeHelpTiles(fixtureRows(), seededRandom(42));
    const again = placeHelpTiles(fixtureRows(), seededRandom(42));
    assert.deepEqual(first, again);

    const placements = new Set<string>();
    for (let seed = 1; seed <= SEED_COUNT; seed += 1) {
      const rows = placeHelpTiles(fixtureRows(), seededRandom(seed));
      placements.add(JSON.stringify(rows.map((row) => row.helpTile ?? null)));
    }
    assert.ok(placements.size > 1, 'expected different random sequences to produce different placements');
  });
});
