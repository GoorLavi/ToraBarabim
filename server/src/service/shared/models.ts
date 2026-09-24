import type { LessonAudience, LessonTopic, RabbiHonorific, Weekday } from '@torabarabim/common';
import { z } from 'zod';

import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
// The field shape lives here, shared by both panels; the thresholds it
// reads stay in the course domain's own `consts.ts`, per the plan's split.
import {
  COURSE_CYCLE_MAX,
  COURSE_CYCLE_MIN,
  COURSE_DESCRIPTION_MAX_LENGTH,
  COURSE_HOURS_MAX,
  COURSE_HOURS_MIN,
  COURSE_NAME_MAX_LENGTH,
  COURSE_PRICE_MAX,
  COURSE_PRICE_MIN,
  COURSE_SESSIONS_MAX,
  COURSE_SESSIONS_MIN,
  COURSE_TOPIC_OTHER_MAX_LENGTH,
  COURSE_WEEKS_MAX,
  COURSE_WEEKS_MIN,
} from '../course/consts';

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

// Strips spaces and dashes, then a leading `+972`/`972`, replacing it with
// the local trunk `0`, before checking the Israeli mobile shape. The
// original, untouched input is what the error names, not the normalized
// form, so a mistyped number reads back exactly as typed.
const normalizeIsraeliMobile = (raw: string): string => raw.replace(/[\s-]/g, '').replace(/^\+?972/, '0');

const ISRAELI_MOBILE_PATTERN = /^05\d{8}$/;

export const contactPhoneSchema = z
  .string()
  .trim()
  .min(1)
  .transform((raw, ctx) => {
    const normalized = normalizeIsraeliMobile(raw);
    if (!ISRAELI_MOBILE_PATTERN.test(normalized)) {
      ctx.addIssue({ code: 'custom', message: `מספר טלפון לא תקין. צריך מספר נייד ישראלי כמו 050-1234567, וכאן זה '${raw}'.` });
      return z.NEVER;
    }
    return normalized;
  });

const NON_OTHER_LESSON_TOPICS = LESSON_TOPICS.filter((topic): topic is Exclude<LessonTopic, 'other'> => topic !== 'other');

// Mirrors the wire `CourseTopic`: a listed topic on its own, or 'other'
// paired with the free text that names it. `courses_topic_shape` (the
// schema CHECK) is this same rule enforced a second time in the database.
export const courseTopicInputSchema = z.discriminatedUnion('value', [
  z.object({ value: z.enum(NON_OTHER_LESSON_TOPICS) }),
  z.object({ value: z.literal('other'), otherText: z.string().trim().min(1).max(COURSE_TOPIC_OTHER_MAX_LENGTH) }),
]);

// The fields every course create and update shares, on both panels. Never
// includes the teacher (the rabbi path has none to send, the admin path
// adds it separately), `registrationClosedAt`, `closeReason`, `published`,
// a cover key, a photo key, or `position`: nothing here can ever set what
// only the close, full, or photo routes may set.
export const courseFieldsSchema = z.object({
  name: z.string().trim().min(1).max(COURSE_NAME_MAX_LENGTH),
  cycle: z.number().int().min(COURSE_CYCLE_MIN).max(COURSE_CYCLE_MAX).optional(),
  description: z.string().trim().min(1).max(COURSE_DESCRIPTION_MAX_LENGTH),
  openingDate: z.iso.date(),
  weeks: z.number().int().min(COURSE_WEEKS_MIN).max(COURSE_WEEKS_MAX),
  sessions: z.number().int().min(COURSE_SESSIONS_MIN).max(COURSE_SESSIONS_MAX),
  hours: z.number().int().min(COURSE_HOURS_MIN).max(COURSE_HOURS_MAX).optional(),
  venue: lessonVenueInputSchema,
  audience: z.enum(LESSON_AUDIENCES),
  topic: courseTopicInputSchema.optional(),
  joinableAfterOpening: z.boolean(),
  contactPhone: contactPhoneSchema,
  // Never 0: the owner refused a free course outright, so the Zod minimum
  // itself is the enforcement, not a separate check downstream.
  priceShekels: z
    .number()
    .int()
    .min(COURSE_PRICE_MIN, 'המחיר חייב להיות לפחות 1 ₪. כדי לא להציג מחיר, משאירים ריק.')
    .max(COURSE_PRICE_MAX)
    .optional(),
});
export type CourseFieldsInput = z.infer<typeof courseFieldsSchema>;

// Shared by both panels' `POST .../:id/duplicate`: the new opening date and
// an optional cycle number for the copy.
export const duplicateCourseSchema = z.object({
  openingDate: z.iso.date(),
  cycle: z.number().int().min(COURSE_CYCLE_MIN).max(COURSE_CYCLE_MAX).optional(),
});
export type DuplicateCourseInput = z.infer<typeof duplicateCourseSchema>;
