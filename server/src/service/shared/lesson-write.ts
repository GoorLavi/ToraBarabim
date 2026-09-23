import type { LessonAudience, LessonProvenance, LessonTopic, LessonVenuePanel, Recurrence, Weekday } from '@torabarabim/common';
import { and, eq } from 'drizzle-orm';

import { db, type Tx } from '../../db/client';
import { cities, lessons, places } from '../../db/schema';
import type { AddressCityRow, AddressPlaceRow } from './address';
import { toVenuePanel } from './address';
import type { LessonVenueInputSchema } from './models';
import { assertAudienceAllowedForHonorific, assertAudienceAllowedForRabbi, getRabbiHonorific } from './rabbanit-guard';

// The columns both `admin-lesson` and `rabbi-lesson` read a lesson through.
// A lesson's `cityCode` always resolves (the column is `NOT NULL` and
// references `cities.code`), so an inner join never drops a row. `places`
// is a left join: `placeId` is null on an address-only lesson.
export const lessonSelection = {
  id: lessons.id,
  title: lessons.title,
  rabbiId: lessons.rabbiId,
  placeId: lessons.placeId,
  addressName: lessons.addressName,
  addressStreet: lessons.addressStreet,
  addressFloor: lessons.addressFloor,
  cityCode: lessons.cityCode,
  cityName: cities.nameHe,
  cityArea: cities.area,
  placeSlug: places.slug,
  placeName: places.name,
  placeStreet: places.street,
  placeFloor: places.floor,
  placeIsActive: places.isActive,
  topic: lessons.topic,
  audience: lessons.audience,
  recurrenceKind: lessons.recurrenceKind,
  recurrenceWeekdays: lessons.recurrenceWeekdays,
  recurrenceDate: lessons.recurrenceDate,
  startTime: lessons.startTime,
  durationMinutes: lessons.durationMinutes,
  notes: lessons.notes,
  provenance: lessons.provenance,
  updatedAt: lessons.updatedAt,
};

export const baseLessonQuery = () =>
  db
    .select(lessonSelection)
    .from(lessons)
    .innerJoin(cities, eq(lessons.cityCode, cities.code))
    .leftJoin(places, eq(lessons.placeId, places.id));

type JoinedLessonRow = Awaited<ReturnType<typeof baseLessonQuery>>[number];

// The read-side shape both `LessonRecord` (admin-lesson) and
// `RabbiLessonRecord` (rabbi-lesson) are structurally identical to, so a
// caller's own domain type never needs a cast to receive it.
export interface LessonWriteRecord {
  id: string;
  title?: string;
  rabbiId: string;
  venue: LessonVenuePanel;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
  provenance: LessonProvenance;
}

const toVenueFromJoinedRow = (row: JoinedLessonRow): LessonVenuePanel => {
  const cityByCode = new Map<number, AddressCityRow>([[row.cityCode, { code: row.cityCode, nameHe: row.cityName, area: row.cityArea }]]);
  const placeById = new Map<string, AddressPlaceRow>(
    row.placeId !== null
      ? [[row.placeId, { id: row.placeId, slug: row.placeSlug as string, name: row.placeName as string, street: row.placeStreet as string, floor: row.placeFloor, isActive: row.placeIsActive as boolean }]]
      : [],
  );
  const ref =
    row.placeId !== null
      ? ({ kind: 'place', placeId: row.placeId, cityCode: row.cityCode } as const)
      : ({ kind: 'address', name: row.addressName as string, street: row.addressStreet as string, floor: row.addressFloor ?? undefined, cityCode: row.cityCode } as const);
  return toVenuePanel(ref, cityByCode, placeById);
};

export const toLessonWriteRecord = (row: JoinedLessonRow): LessonWriteRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  venue: toVenueFromJoinedRow(row),
  topic: row.topic ?? undefined,
  audience: row.audience,
  // The `lessons_recurrence_shape` check constraint guarantees weekdays is
  // set for 'weekly' and date is set for 'once'; TS cannot see a DB constraint.
  recurrence:
    row.recurrenceKind === 'weekly'
      ? { kind: 'weekly', weekdays: row.recurrenceWeekdays as Weekday[] }
      : { kind: 'once', date: row.recurrenceDate as string },
  startTime: row.startTime,
  durationMinutes: row.durationMinutes,
  notes: row.notes ?? undefined,
  provenance: row.provenance,
});

export interface VerifyReferencesOptions {
  rabbiId: string;
  // Present only for the address arm of a venue: a place-backed venue names
  // no cityCode of its own to check here, and `lessonVenueColumns` already
  // verifies the place itself exists and is active (which implies a valid
  // city, via that row's own foreign key).
  cityCode?: number;
  audience: LessonAudience;
  onUnknownCity: (cityCode: number) => Error;
  // Only `admin-lesson` needs this: an admin can name any rabbiId, so its
  // existence has to be checked. A rabbi's own writer never needs it, since
  // its `rabbiId` is always the authenticated session's own id.
  onReferencedRabbiNotFound?: (rabbiId: string) => Error;
}

// Verifies the rabbi and (address-arm) city references exist, and that a
// rabbanit is never assigned a lesson whose audience is not 'women'.
export const verifyReferences = async (options: VerifyReferencesOptions): Promise<void> => {
  const { rabbiId, cityCode, audience, onUnknownCity, onReferencedRabbiNotFound } = options;

  const verifyCityExists = async (): Promise<void> => {
    if (cityCode === undefined) return;
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
    if (!rows[0]) throw onUnknownCity(cityCode);
  };

  if (onReferencedRabbiNotFound) {
    const [honorific] = await Promise.all([getRabbiHonorific(rabbiId), verifyCityExists()]);
    if (honorific === undefined) throw onReferencedRabbiNotFound(rabbiId);
    assertAudienceAllowedForHonorific(honorific, rabbiId, audience);
    return;
  }

  await Promise.all([verifyCityExists(), assertAudienceAllowedForRabbi(rabbiId, audience)]);
};

// The full-replacement column set every writer of a lesson's venue produces.
// Mirrors the `lessons_venue_shape` CHECK constraint exactly: a place-backed
// row carries no address text, and an address-only row carries no place id.
export type LessonVenueColumns =
  | { placeId: string; cityCode: number; addressName: null; addressStreet: null; addressFloor: null }
  | { placeId: null; cityCode: number; addressName: string; addressStreet: string; addressFloor: string | null };

export interface LessonVenueColumnsOptions {
  // Only a create/update needs this: it names the placeId it could not
  // resolve, so the caller can map it to its own 400. The import never
  // produces a place reference in the first place (see its own call
  // site), and the seed's place is always inserted first, so neither ever
  // needs it.
  onPlaceNotFound?: (placeId: string) => Error;
  // Passed by a caller that must see its own uncommitted writes, e.g. the
  // seed, which inserts a place and a lesson referencing it in the same
  // transaction: the place would not exist yet from `db`'s own connection.
  executor?: Tx | typeof db;
}

// The one producer of `lessons.place_id`/`place_name`/`place_street`/
// `place_floor`/`city_code`. `cityCode` is denormalized onto the row even
// for a place-backed lesson: the owner's call, because it is the only SQL
// narrowing on the public search's hot path and a join would make every one
// of that search's city/area filters non-sargable. That is a real gap the
// compiler cannot close: nothing stops a future writer from setting these
// columns by hand with a stale or unrelated `cityCode`, and no CHECK can
// catch it, since a CHECK cannot read another table. `invariants.test.ts`'s
// T13 (`lessons.city_code <> places.city_code` is always 0) is the only net
// under that gap; every writer below must go through this function and none
// may set these columns any other way.
export const lessonVenueColumns = async (venue: LessonVenueInputSchema, options: LessonVenueColumnsOptions = {}): Promise<LessonVenueColumns> => {
  if (venue.kind === 'address') {
    return { placeId: null, cityCode: venue.cityCode, addressName: venue.name, addressStreet: venue.street, addressFloor: venue.floor ?? null };
  }

  const executor = options.executor ?? db;
  const rows = await executor
    .select({ cityCode: places.cityCode })
    .from(places)
    .where(and(eq(places.id, venue.placeId), eq(places.isActive, true)))
    .limit(1);
  const row = rows[0];
  if (!row) {
    if (!options.onPlaceNotFound) throw new Error(`data inconsistency: expected an active place '${venue.placeId}' to exist`);
    throw options.onPlaceNotFound(venue.placeId);
  }
  return { placeId: venue.placeId, cityCode: row.cityCode, addressName: null, addressStreet: null, addressFloor: null };
};

export interface LessonColumnsInput {
  title?: string;
  venue: LessonVenueInputSchema;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

// The full-replacement column set shared by every create and every update:
// both write the whole row, never a merge, so an omitted optional field
// clears its column with `?? null` rather than leaving a stale value in
// place. `topic` is the one exception, not `?? null`ed here: that is
// carried over as-is from both callers, where an update that omits `topic`
// currently leaves the column's existing value in place. Flagged separately
// as a pre-existing inconsistency, not fixed by this refactor.
export const lessonColumnsFrom = async (input: LessonColumnsInput, options: LessonVenueColumnsOptions = {}) => ({
  title: input.title ?? null,
  ...(await lessonVenueColumns(input.venue, options)),
  topic: input.topic,
  audience: input.audience,
  recurrenceKind: input.recurrence.kind,
  recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
  recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
  startTime: input.startTime,
  durationMinutes: input.durationMinutes,
  notes: input.notes ?? null,
});
