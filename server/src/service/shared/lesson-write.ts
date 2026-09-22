import type { LessonAudience, LessonProvenance, LessonTopic, Recurrence, Weekday } from '@torabarabim/common';
import { eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessons } from '../../db/schema';
import type { LessonPlaceInput, LessonPlaceRecord } from '../admin-lesson/models';
import { assertAudienceAllowedForHonorific, assertAudienceAllowedForRabbi, getRabbiHonorific } from './rabbanit-guard';

// The columns both `admin-lesson` and `rabbi-lesson` read a lesson through.
// A lesson's `cityCode` always resolves (the column is `NOT NULL` and
// references `cities.code`), so an inner join never drops a row.
export const lessonSelection = {
  id: lessons.id,
  title: lessons.title,
  rabbiId: lessons.rabbiId,
  addressName: lessons.addressName,
  addressStreet: lessons.addressStreet,
  addressFloor: lessons.addressFloor,
  cityCode: lessons.cityCode,
  cityName: cities.nameHe,
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

export const baseLessonQuery = () => db.select(lessonSelection).from(lessons).innerJoin(cities, eq(lessons.cityCode, cities.code));

type JoinedLessonRow = Awaited<ReturnType<typeof baseLessonQuery>>[number];

// The read-side shape both `LessonRecord` (admin-lesson) and
// `RabbiLessonRecord` (rabbi-lesson) are structurally identical to, so a
// caller's own domain type never needs a cast to receive it.
export interface LessonWriteRecord {
  id: string;
  title?: string;
  rabbiId: string;
  place: LessonPlaceRecord;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
  provenance: LessonProvenance;
}

export const toLessonWriteRecord = (row: JoinedLessonRow): LessonWriteRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: {
    name: row.addressName,
    street: row.addressStreet,
    floor: row.addressFloor ?? undefined,
    cityCode: row.cityCode,
    cityName: row.cityName,
  },
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
  cityCode: number;
  audience: LessonAudience;
  onUnknownCity: (cityCode: number) => Error;
  // Only `admin-lesson` needs this: an admin can name any rabbiId, so its
  // existence has to be checked. A rabbi's own writer never needs it, since
  // its `rabbiId` is always the authenticated session's own id.
  onReferencedRabbiNotFound?: (rabbiId: string) => Error;
}

// Verifies the rabbi and city references exist, and that a rabbanit is
// never assigned a lesson whose audience is not 'women'.
export const verifyReferences = async (options: VerifyReferencesOptions): Promise<void> => {
  const { rabbiId, cityCode, audience, onUnknownCity, onReferencedRabbiNotFound } = options;

  if (onReferencedRabbiNotFound) {
    const [honorific, cityRows] = await Promise.all([
      getRabbiHonorific(rabbiId),
      db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1),
    ]);
    if (honorific === undefined) throw onReferencedRabbiNotFound(rabbiId);
    if (!cityRows[0]) throw onUnknownCity(cityCode);
    assertAudienceAllowedForHonorific(honorific, rabbiId, audience);
    return;
  }

  const verifyCityExists = async (): Promise<void> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
    if (!rows[0]) throw onUnknownCity(cityCode);
  };
  await Promise.all([verifyCityExists(), assertAudienceAllowedForRabbi(rabbiId, audience)]);
};

export interface LessonColumnsInput {
  title?: string;
  place: LessonPlaceInput;
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
export const lessonColumnsFrom = (input: LessonColumnsInput) => ({
  title: input.title ?? null,
  addressName: input.place.name,
  addressStreet: input.place.street,
  addressFloor: input.place.floor ?? null,
  cityCode: input.place.cityCode,
  topic: input.topic,
  audience: input.audience,
  recurrenceKind: input.recurrence.kind,
  recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
  recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
  startTime: input.startTime,
  durationMinutes: input.durationMinutes,
  notes: input.notes ?? null,
});
