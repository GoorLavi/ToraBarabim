import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  HELP_TILE_KINDS,
  HELP_TILE_MIN_INDEX,
  HOME_CITY_GRID_CAP,
  MAX_HOME_LESSON_ROWS,
  MAX_LESSONS_PER_RABBI_PER_ROW,
  WOMENS_AREA_TILE_INDEX,
} from '../src/service/home/consts';
import {
  buildRow,
  countLessonsByCity,
  countOccurrencesByCity,
  interleaveRows,
  placeCourseRow,
  placeHelpTiles,
  placeWomensAreaTile,
  rankCitiesForGrid,
  timeBandOf,
} from '../src/service/home/home-rows';
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

const occurrence = (lessonId: string, overrides: Partial<ResolvedHomeOccurrence> = {}): ResolvedHomeOccurrence => ({
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
  ...overrides,
});

const lessonRowWithItems = (id: LessonHomeRowResult['id'], itemCount: number): LessonHomeRowResult => ({
  kind: 'lessons',
  id,
  title: id,
  items: Array.from({ length: itemCount }, (_, index) => occurrence(`${id}-${index}`)),
});

// Ten lesson rows, each at a length the real page can produce, with the
// women's-area tile where `placeWomensAreaTile` puts it (the sixth row).
const fixtureRows = (): LessonHomeRowResult[] =>
  placeWomensAreaTile([
    lessonRowWithItems('today', 12),
    lessonRowWithItems('area:jerusalem', 3),
    lessonRowWithItems('topic:gemara', 5),
    lessonRowWithItems('bothAudiences', 5),
    lessonRowWithItems('area:center', 3),
    lessonRowWithItems('topic:halacha', 12),
    lessonRowWithItems('weekly', 3),
    lessonRowWithItems('area:north', 4),
    lessonRowWithItems('morning', 3),
    lessonRowWithItems('area:south', 3),
  ]);

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

const rowOf = (id: LessonHomeRowResult['id']): LessonHomeRowResult => lessonRow(id);
const idsOf = (rows: LessonHomeRowResult[]): string[] => rows.map((row) => row.id);

describe('interleaveRows', () => {
  const fixedRows = (...ids: LessonHomeRowResult['id'][]): LessonHomeRowResult[] => ids.map(rowOf);

  test('five fixed rows and five areas alternate, today first', () => {
    const rows = interleaveRows({
      fixed: fixedRows('today', 'bothAudiences', 'weekly', 'morning', 'midday'),
      areas: fixedRows('area:north', 'area:haifa', 'area:sharon', 'area:center', 'area:telAviv'),
      topics: [],
    });

    assert.deepEqual(idsOf(rows), [
      'today',
      'area:north',
      'bothAudiences',
      'area:haifa',
      'weekly',
      'area:sharon',
      'morning',
      'area:center',
      'midday',
      'area:telAviv',
    ]);
  });

  test('two topics join each round and the result is cut at the cap', () => {
    const rows = interleaveRows({
      fixed: fixedRows('today', 'bothAudiences', 'weekly', 'morning', 'midday'),
      areas: fixedRows('area:north', 'area:haifa', 'area:sharon', 'area:center', 'area:telAviv'),
      topics: fixedRows('topic:gemara', 'topic:halacha'),
    });

    assert.deepEqual(idsOf(rows), [
      'today',
      'area:north',
      'topic:gemara',
      'bothAudiences',
      'area:haifa',
      'topic:halacha',
      'weekly',
      'area:sharon',
      'morning',
      'area:center',
    ]);
    assert.equal(rows.length, MAX_HOME_LESSON_ROWS);
  });

  test('a thin page stops where the next area would sit beside an area', () => {
    const rows = interleaveRows({
      fixed: fixedRows('weekly', 'morning'),
      areas: fixedRows('area:north', 'area:haifa', 'area:sharon'),
      topics: [],
    });

    assert.deepEqual(idsOf(rows), ['weekly', 'area:north', 'morning', 'area:haifa']);
  });

  test('no rows at all gives no rows', () => {
    assert.deepEqual(interleaveRows({ fixed: [], areas: [], topics: [] }), []);
  });

  test('any mix of family sizes never puts two areas or two topics side by side and never exceeds the cap', () => {
    const areaIds = ['area:north', 'area:haifa', 'area:sharon', 'area:center', 'area:telAviv'] as const;
    const topicIds = ['topic:gemara', 'topic:halacha', 'topic:parasha', 'topic:mussar'] as const;
    const fixedIds = ['today', 'bothAudiences', 'weekly', 'morning', 'midday'] as const;

    for (let seed = 1; seed <= SEED_COUNT; seed += 1) {
      const random = seededRandom(seed);
      const rows = interleaveRows({
        fixed: fixedRows(...fixedIds.slice(0, Math.floor(random() * (fixedIds.length + 1)))),
        areas: fixedRows(...areaIds.slice(0, Math.floor(random() * (areaIds.length + 1)))),
        topics: fixedRows(...topicIds.slice(0, Math.floor(random() * (topicIds.length + 1)))),
      });

      assert.ok(rows.length <= MAX_HOME_LESSON_ROWS, `seed ${seed}: ${rows.length} rows`);
      rows.forEach((row, index) => {
        const previous = rows[index - 1];
        if (!previous) return;
        for (const prefix of ['area:', 'topic:']) {
          assert.ok(!(row.id.startsWith(prefix) && previous.id.startsWith(prefix)), `seed ${seed}: ${previous.id} then ${row.id}`);
        }
      });
    }
  });
});

describe('buildRow and the per-rabbi cap', () => {
  const rabbiNamed = (id: string) => ({ id, name: id, honorific: 'rav' as const, slug: id });

  test('six lessons by one sought rabbi and four by locals keep exactly two of his, first', () => {
    const sought = Array.from({ length: 6 }, (_, index) =>
      occurrence(`sought-${index}`, { rabbi: rabbiNamed('sought'), rabbiProminenceRank: 0, shuffleKey: index }),
    );
    const locals = Array.from({ length: 4 }, (_, index) =>
      occurrence(`local-${index}`, { rabbi: rabbiNamed(`local-${index}`), rabbiProminenceRank: 2, shuffleKey: index }),
    );

    const row = buildRow('today', 'שיעורים היום', [...locals, ...sought]);

    assert.ok(row);
    assert.deepEqual(
      row.items.map((item) => item.lessonId),
      ['sought-0', 'sought-1', 'local-0', 'local-1', 'local-2', 'local-3'],
    );
    assert.equal(MAX_LESSONS_PER_RABBI_PER_ROW, 2);
  });

  test('a substitute counts toward the substitute, not the lesson owner', () => {
    const owner = rabbiNamed('owner');
    const substitute = rabbiNamed('substitute');
    const ownersOwn = [0, 1].map((index) => occurrence(`own-${index}`, { rabbi: owner, shuffleKey: index }));
    const covered = [0, 1, 2].map((index) => occurrence(`covered-${index}`, { rabbi: owner, substituteRabbi: substitute, shuffleKey: 10 + index }));
    const other = occurrence('other', { rabbi: rabbiNamed('other'), shuffleKey: 20 });

    const row = buildRow('weekly', 'שיעורים קבועים כל שבוע', [...ownersOwn, ...covered, other]);

    assert.ok(row);
    assert.deepEqual(
      row.items.map((item) => item.lessonId),
      ['own-0', 'own-1', 'covered-0', 'covered-1', 'other'],
    );
  });

  test('a row held by one rabbi alone falls under the minimum and is dropped', () => {
    const matches = Array.from({ length: 6 }, (_, index) => occurrence(`only-${index}`, { shuffleKey: index }));

    assert.equal(buildRow('today', 'שיעורים היום', matches), undefined);
  });

  test('a lesson appears once in a row, at its nearest date', () => {
    const matches = [
      occurrence('weekly', { date: '2026-01-08', rabbi: rabbiNamed('a') }),
      occurrence('weekly', { date: '2026-01-01', rabbi: rabbiNamed('a') }),
      occurrence('two', { rabbi: rabbiNamed('b') }),
      occurrence('three', { rabbi: rabbiNamed('c') }),
    ];

    const row = buildRow('weekly', 'שיעורים קבועים כל שבוע', matches);

    assert.ok(row);
    assert.equal(row.items.filter((item) => item.lessonId === 'weekly').length, 1);
    assert.equal(row.items.find((item) => item.lessonId === 'weekly')?.date, '2026-01-01');
  });
});

describe('placeWomensAreaTile', () => {
  const tileRowIds = (rows: LessonHomeRowResult[]): string[] => rows.filter((row) => row.womensAreaTileIndex !== undefined).map((row) => row.id);

  test('on ten rows the tile lands once, on the first qualifying row from the sixth', () => {
    const rows = fixtureRows();

    assert.deepEqual(tileRowIds(rows), ['topic:halacha']);
    assert.equal(rows[5]?.womensAreaTileIndex, WOMENS_AREA_TILE_INDEX);
  });

  test('a row from the sixth with too few lessons is skipped for the next that has room', () => {
    const rows = placeWomensAreaTile([
      ...Array.from({ length: 5 }, () => lessonRowWithItems('area:north', 12)),
      lessonRowWithItems('weekly', 3),
      lessonRowWithItems('morning', 4),
    ]);

    assert.deepEqual(tileRowIds(rows), ['morning']);
  });

  test('on four rows it falls back to the first qualifying row from the second', () => {
    const rows = placeWomensAreaTile([
      lessonRowWithItems('today', 12),
      lessonRowWithItems('area:north', 3),
      lessonRowWithItems('weekly', 5),
      lessonRowWithItems('morning', 5),
    ]);

    assert.deepEqual(tileRowIds(rows), ['weekly']);
  });

  test('no row with room means no tile, and the input is untouched', () => {
    const input = [lessonRowWithItems('today', 3), lessonRowWithItems('weekly', 3)];

    assert.deepEqual(placeWomensAreaTile(input), input);
  });
});

describe('timeBandOf', () => {
  test('the boundaries fall on 12:00 and 16:00', () => {
    assert.equal(timeBandOf('11:59'), 'morning');
    assert.equal(timeBandOf('12:00'), 'midday');
    assert.equal(timeBandOf('15:59'), 'midday');
    assert.equal(timeBandOf('16:00'), undefined);
  });
});

describe('the city grid counts', () => {
  const cityRow = (code: number, nameHe: string) => ({ code, nameHe, area: 'center' as const });
  const cityByCode = new Map([cityRow(1, 'בני ברק'), cityRow(2, 'אשדוד'), cityRow(3, 'חיפה')].map((row) => [row.code, row] as const));

  test('a weekly lesson twice in the window counts once for the grid and twice for the women set', () => {
    const occurrences = [
      occurrence('weekly', { cityCode: 1, date: '2026-01-01' }),
      occurrence('weekly', { cityCode: 1, date: '2026-01-08' }),
      occurrence('once', { cityCode: 1 }),
    ];

    assert.equal(countLessonsByCity(occurrences, cityByCode)[0]?.lessonCount, 2);
    assert.equal(countOccurrencesByCity(occurrences, cityByCode)[0]?.lessonCount, 3);
  });

  test('sorts by count descending, then by name', () => {
    const occurrences = [
      occurrence('a', { cityCode: 1 }),
      occurrence('b', { cityCode: 1 }),
      occurrence('c', { cityCode: 3 }),
      occurrence('d', { cityCode: 2 }),
    ];

    const ranked = rankCitiesForGrid(countLessonsByCity(occurrences, cityByCode));

    assert.deepEqual(
      ranked.map((city) => [city.name, city.lessonCount]),
      [
        ['בני ברק', 2],
        ['אשדוד', 1],
        ['חיפה', 1],
      ],
    );
  });

  test('keeps only the cap', () => {
    const manyCities = new Map(Array.from({ length: HOME_CITY_GRID_CAP + 5 }, (_, index) => [index, cityRow(index, `עיר ${index}`)] as const));
    const occurrences = [...manyCities.keys()].map((code) => occurrence(`lesson-${code}`, { cityCode: code }));

    assert.equal(rankCitiesForGrid(countLessonsByCity(occurrences, manyCities)).length, HOME_CITY_GRID_CAP);
  });

  test('a lesson in a city missing from the reference table is a loud failure, naming the code', () => {
    assert.throws(() => countLessonsByCity([occurrence('x', { cityCode: 99 })], cityByCode), /unknown city code 99/);
  });
});
