import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { compareRabbiOrder } from '../src/service/shared/rabbi-order';
import type { RabbiOrderInput } from '../src/service/shared/rabbi-order';

// Pure logic, so this suite needs neither a database nor a built client,
// unlike the rest of `server/test/`. It exists because the two rules the
// API tests cannot reach, the has-lessons tie-break and the id tie-break,
// are exactly the ones whose failure makes a rabbi appear twice in
// `/rabbis` and another vanish.
const rabbi = (overrides: Partial<RabbiOrderInput> & { id: string }): RabbiOrderInput => ({
  name: 'אברהם כהן',
  prominence: 'local',
  hasLessons: true,
  ...overrides,
});

const orderedIds = (input: RabbiOrderInput[]): string[] => [...input].sort(compareRabbiOrder).map((entry) => entry.id);

describe('compareRabbiOrder', () => {
  test('a higher tier sorts first, whatever the name and whatever the lessons', () => {
    const local = rabbi({ id: 'local', prominence: 'local', name: 'אברהם כהן' });
    const known = rabbi({ id: 'known', prominence: 'known', name: 'תמיר לוי', hasLessons: false });
    const sought = rabbi({ id: 'sought', prominence: 'sought', name: 'תמיר לוי', hasLessons: false });

    assert.deepEqual(orderedIds([local, known, sought]), ['sought', 'known', 'local']);
  });

  test('within a tier, a rabbi with lessons comes before one with none', () => {
    const withLessons = rabbi({ id: 'with-lessons', name: 'תמיר לוי', hasLessons: true });
    const withoutLessons = rabbi({ id: 'without-lessons', name: 'אברהם כהן', hasLessons: false });

    assert.deepEqual(orderedIds([withoutLessons, withLessons]), ['with-lessons', 'without-lessons']);
  });

  test('within a tier, and with lessons equal, Hebrew collation on the name decides', () => {
    const shimon = rabbi({ id: 'shimon', name: 'שמעון אזולאי' });
    const david = rabbi({ id: 'david', name: 'דוד עמאר' });
    const avraham = rabbi({ id: 'avraham', name: 'אברהם כהן' });

    assert.deepEqual(orderedIds([shimon, david, avraham]), ['avraham', 'david', 'shimon']);
  });

  test('two rabbis sharing a name are still ordered, and always the same way', () => {
    const second = rabbi({ id: 'rabbi-b', name: 'אברהם כהן' });
    const first = rabbi({ id: 'rabbi-a', name: 'אברהם כהן' });

    assert.equal(compareRabbiOrder(first, second) < 0, true);
    assert.deepEqual(orderedIds([second, first]), ['rabbi-a', 'rabbi-b']);
    assert.deepEqual(orderedIds([first, second]), ['rabbi-a', 'rabbi-b']);
  });

  test('a rabbi never sorts before or after himself', () => {
    const entry = rabbi({ id: 'rabbi-a' });

    assert.equal(compareRabbiOrder(entry, entry), 0);
  });
});
