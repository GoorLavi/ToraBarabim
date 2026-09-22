import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../src/db/client';
import { adminUsers, cities, lessons, places } from '../src/db/schema';
import { isSimilarAddress, type SimilarAddressCandidate } from '../src/service/place/place';
import { assertDatabaseReachable, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';
const SEEDED_RABBI_ID = 'rabbi-1';

const uniqueSuffix = (): string => nanoid(8);

// drizzle-orm's postgres-js driver wraps the real `PostgresError` (with its
// SQLSTATE `code` and, for a CHECK violation, `constraint_name`) on
// `.cause`, not on the thrown error itself. Mirrors the same unwrap every
// other suite in this repo already does for a unique violation.
const asPostgresError = (error: unknown): postgres.PostgresError | undefined => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError ? cause : undefined;
};

const CHECK_VIOLATION = '23514';
const UNIQUE_VIOLATION = '23505';

describe('database invariants', () => {
  const cleanupLessonIds = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();
  const cleanupPlaceIds = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
  });

  afterEach(async () => {
    for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
    cleanupLessonIds.clear();
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    cleanupAdminUserIds.clear();
    for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
    cleanupPlaceIds.clear();
  });

  after(async () => {
    await rawClient.end({ timeout: 5 });
  });

  const jerusalemCode = async (): Promise<number> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
    const row = rows[0];
    if (!row) throw new Error('expected the seeded city to exist');
    return row.code;
  };

  const createPlace = async (cityCode: number): Promise<string> => {
    const id = `test-place-${uniqueSuffix()}`;
    await db.insert(places).values({ id, slug: id, name: `מקום בדיקה ${uniqueSuffix()}`, street: 'רחוב הבדיקה 1', cityCode });
    cleanupPlaceIds.add(id);
    return id;
  };

  // T1: `lessons_venue_shape` rejects both a place and an address, and
  // rejects neither.
  describe('lessons_venue_shape', () => {
    test('a lesson naming both a place and an address is rejected', async () => {
      const cityCode = await jerusalemCode();
      const placeId = await createPlace(cityCode);
      const id = `test-lesson-${uniqueSuffix()}`;
      cleanupLessonIds.add(id);

      await assert.rejects(
        () =>
          db.insert(lessons).values({
            id,
            rabbiId: SEEDED_RABBI_ID,
            placeId,
            addressName: 'שם כתובת',
            addressStreet: 'רחוב הכתובת 1',
            cityCode,
            audience: 'men',
            recurrenceKind: 'weekly',
            recurrenceWeekdays: [0],
            startTime: '10:00',
            durationMinutes: 30,
          }),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, CHECK_VIOLATION);
          assert.equal(pgError?.constraint_name, 'lessons_venue_shape');
          return true;
        },
      );
    });

    test('a lesson naming neither a place nor an address is rejected', async () => {
      const cityCode = await jerusalemCode();
      const id = `test-lesson-${uniqueSuffix()}`;
      cleanupLessonIds.add(id);

      await assert.rejects(
        () =>
          db.insert(lessons).values({
            id,
            rabbiId: SEEDED_RABBI_ID,
            cityCode,
            audience: 'men',
            recurrenceKind: 'weekly',
            recurrenceWeekdays: [0],
            startTime: '10:00',
            durationMinutes: 30,
          }),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, CHECK_VIOLATION);
          assert.equal(pgError?.constraint_name, 'lessons_venue_shape');
          return true;
        },
      );
    });
  });

  // T2: `admin_users_role_shape` and the nullable-unique treatment of
  // `place_id`, the same shape `rabbi_id` already gets and for the same
  // reason: one account per owner.
  describe('admin_users role/place shape', () => {
    const baseAccount = (overrides: Partial<typeof adminUsers.$inferInsert>): typeof adminUsers.$inferInsert => ({
      id: `test-admin-${uniqueSuffix()}`,
      email: `test-admin-${uniqueSuffix()}@example.com`,
      passwordHash: 'not-a-real-hash',
      name: 'חשבון בדיקה',
      role: 'admin',
      ...overrides,
    });

    test("role='place' with a null place_id is rejected", async () => {
      const account = baseAccount({ role: 'place', placeId: null });
      cleanupAdminUserIds.add(account.id);

      await assert.rejects(
        () => db.insert(adminUsers).values(account),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, CHECK_VIOLATION);
          assert.equal(pgError?.constraint_name, 'admin_users_role_shape');
          return true;
        },
      );
    });

    test("role='place' carrying a rabbi_id is rejected", async () => {
      const cityCode = await jerusalemCode();
      const placeId = await createPlace(cityCode);
      const account = baseAccount({ role: 'place', placeId, rabbiId: SEEDED_RABBI_ID });
      cleanupAdminUserIds.add(account.id);

      await assert.rejects(
        () => db.insert(adminUsers).values(account),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, CHECK_VIOLATION);
          assert.equal(pgError?.constraint_name, 'admin_users_role_shape');
          return true;
        },
      );
    });

    test('a second account for the same place_id is rejected', async () => {
      const cityCode = await jerusalemCode();
      const placeId = await createPlace(cityCode);

      const first = baseAccount({ role: 'place', placeId });
      cleanupAdminUserIds.add(first.id);
      await db.insert(adminUsers).values(first);

      const second = baseAccount({ role: 'place', placeId });
      cleanupAdminUserIds.add(second.id);

      await assert.rejects(
        () => db.insert(adminUsers).values(second),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, UNIQUE_VIOLATION);
          assert.equal(pgError?.constraint_name, 'admin_users_place_id_unique');
          return true;
        },
      );
    });
  });

  // T8: `isSimilarAddress` is pure and takes no database; these cases are
  // exactly the ones the duplicate hint's contract names, including the two
  // documented gaps (see the comment on `isSimilarAddress` itself).
  describe('isSimilarAddress', () => {
    const JERUSALEM = 1;
    const TEL_AVIV = 2;

    const candidate = (overrides: Partial<SimilarAddressCandidate> = {}): SimilarAddressCandidate => ({
      street: 'רחוב הרצל 12',
      name: 'בית הכנסת המרכזי',
      cityCode: JERUSALEM,
      isActive: true,
      ...overrides,
    });

    test('matches on an identical street after toSlug', () => {
      const result = isSimilarAddress({ cityCode: JERUSALEM, street: 'רחוב הרצל 12' }, candidate());
      assert.equal(result, true);
    });

    test('matches on an identical name', () => {
      const result = isSimilarAddress({ cityCode: JERUSALEM, name: 'בית הכנסת המרכזי' }, candidate());
      assert.equal(result, true);
    });

    test('never matches across cities, even with an identical street', () => {
      const result = isSimilarAddress({ cityCode: TEL_AVIV, street: 'רחוב הרצל 12' }, candidate({ cityCode: JERUSALEM }));
      assert.equal(result, false);
    });

    test('never matches an inactive place', () => {
      const result = isSimilarAddress({ cityCode: JERUSALEM, street: 'רחוב הרצל 12' }, candidate({ isActive: false }));
      assert.equal(result, false);
    });

    // The documented gap: a trailing letter survives `toSlug`, so 'הרצל 12'
    // and 'הרצל 12א' are not the same slug and must not match. Asserted so
    // nobody "fixes" this into a fuzzy match by accident.
    test("never matches 'הרצל 12' to 'הרצל 12א'", () => {
      const result = isSimilarAddress({ cityCode: JERUSALEM, street: 'הרצל 12' }, candidate({ street: 'הרצל 12א' }));
      assert.equal(result, false);
    });
  });

  // T13: the only net under the `lessonVenueColumns` chokepoint decision.
  // Nothing else in the schema can catch a place-backed lesson whose own
  // `city_code` disagrees with its place's, since a CHECK cannot read
  // another table.
  test('T13: no lesson disagrees with its place about which city it is in', async () => {
    const rows = await rawClient`
      SELECT count(*)::int AS count
      FROM lessons
      JOIN places ON lessons.place_id = places.id
      WHERE lessons.city_code <> places.city_code
    `;
    assert.equal(rows[0]?.count, 0);
  });
});
