import type { LessonAudience, RabbiHonorific, Weekday } from '@torabarabim/common';
import { z } from 'zod';

export interface AudienceScopedLesson {
  audience: LessonAudience;
  // Always the lesson's own rabbi's honorific (`lessons.rabbiId`), never a
  // substitute's: a rabbanit never substitutes for a rav, so a substitute's
  // honorific cannot change what scope a lesson belongs to.
  teacherHonorific: RabbiHonorific;
}

export interface AudienceScopeContext {
  // Whether the search query text matched this lesson's own rabbi by name
  // (not her venue, not a city). Unset outside a search (the home rails,
  // the city rail), where the name exception never applies.
  teacherNameMatched?: boolean;
}

// The free-text arm of a lesson's venue: nobody needs to "recognise" a
// synagogue for this arm, and it stays available even once a place is
// registered, since a lesson names one or the other, never both.
// `cityCode` must resolve to a row in `cities` (checked in the service, not
// here: a static schema cannot query the database).
export const lessonAddressSchema = z.object({
  name: z.string().trim().min(1),
  street: z.string().trim().min(1),
  floor: z.string().trim().min(1).optional(),
  cityCode: z.number().int().positive(),
});
export type LessonAddressInput = z.infer<typeof lessonAddressSchema>;

// The read-side shape: `LessonAddressInput` plus the city name resolved
// from `cityCode`, so an admin or rabbi client never has to look up a city
// by code.
export interface LessonAddressRecord extends LessonAddressInput {
  cityName: string;
}

// What a lesson create or update names as its venue: an existing, active
// place by id, or its own free-text address. Mirrors the wire
// `LessonVenueInput` exactly, so `createLessonSchema`'s inferred type
// satisfies it without a cast.
export const lessonVenueInputSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('place'), placeId: z.string().trim().min(1) }),
  lessonAddressSchema.extend({ kind: z.literal('address') }),
]);
export type LessonVenueInputSchema = z.infer<typeof lessonVenueInputSchema>;

const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]) satisfies z.ZodType<Weekday>;

// Mirrors the `lessons_recurrence_shape` CHECK constraint exactly: 'weekly'
// carries weekdays and no date, 'once' carries a date and no weekdays, so
// the two can never disagree. Shared by the admin and rabbi lesson schemas,
// which both write the same shape.
export const recurrenceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('weekly'), weekdays: z.array(weekdaySchema).min(1) }),
  z.object({ kind: z.literal('once'), date: z.iso.date() }),
]);
