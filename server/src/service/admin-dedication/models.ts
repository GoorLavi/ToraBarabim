import type { DedicationHonorific, DedicationType, HonoredGender } from '@torabarabim/common';
import { z } from 'zod';

import { DEDICATION_HONORIFICS, DEDICATION_TYPES, HONORED_GENDERS } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const dedicationIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const dedicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type DedicationListQuery = z.infer<typeof dedicationListQuerySchema>;

// A dedication's name fields are Hebrew display text composed directly onto
// the home page, never free-form input. An ASCII `"` or `'` is rejected
// outright, never `service/shared/slug.ts`'s `toSlug`, which strips
// punctuation (including ASCII quotes) to build a URL segment and would
// therefore silently accept a bad name here instead of rejecting it. Hebrew
// punctuation is `״` (U+05F4) and `׳` (U+05F3), never an ASCII quote.
const ASCII_QUOTE = /["']/;
const NON_BREAKING_SPACE = /\u00a0/;
const dedicationNameSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !ASCII_QUOTE.test(value), {
    message: 'שם עברי אינו יכול להכיל גרש או גרשיים באנגלית (" או \'), יש להשתמש בסימני הפיסוק העבריים ״ ו-׳ בלבד',
  })
  // A stored name holds ordinary spaces only. The composer is the one place
  // that binds a non-breaking space, between the name and its suffix, and a
  // pasted one inside the name would survive into the rendered line and stop
  // it wrapping at 280, which is the width every name is set to wrap at.
  .refine((value) => !NON_BREAKING_SPACE.test(value), {
    message: 'שם נשמר עם רווחים רגילים בלבד, והתקבל רווח קשיח. יש להקליד את השם מחדש במקום להדביק אותו',
  });

const dedicationDateSchema = z.iso.date();

// `honorific` is absent or one of three, and nullable: that is what makes
// "הי״ד replaces ז״ל and never follows it" unrepresentable in the type
// rather than checked at runtime. It is never derived from
// `honoredGender`, and it drives nothing but the suffix on the name line.
const honorificSchema = z.enum(DEDICATION_HONORIFICS).nullable().optional();

// `honoredGender` drives בן versus בת on the parent line and nothing else.
// It is never derived from `honorific`, and `honorific` is never derived
// from it: a female record carrying `zl` composes ז״ל exactly as written.
// Nullable and optional, like `honorific`: a family dedication has no
// `parentName` and therefore no gender to give (`requireGenderWhenParentNamePresent`
// below is what actually makes it required whenever a `parentName` is set).
const honoredGenderSchema = z.enum(HONORED_GENDERS).nullable().optional();

// The plain shape, deliberately without the window refinement below: this
// is the schema `previewDedicationSchema` derives `.partial()` from, and
// `.partial()` throws on an object schema that already carries a
// refinement (zod's own guard). Every field's own rule (the name refine,
// the closed enums) still lives here exactly once.
export const createDedicationSchema = z.object({
  type: z.enum(DEDICATION_TYPES),
  honoredName: dedicationNameSchema,
  honorific: honorificSchema,
  honoredGender: honoredGenderSchema,
  parentName: dedicationNameSchema.optional(),
  donorFamilyName: dedicationNameSchema.optional(),
  closingLineEnabled: z.boolean().default(false),
  startsOn: dedicationDateSchema,
  endsOn: dedicationDateSchema,
});

// Mirrors the `dedications_window` CHECK constraint in Postgres: the two
// must never disagree, so both enforce endsOn >= startsOn.
const requireValidWindow = (value: { startsOn: string; endsOn: string }): boolean => value.endsOn >= value.startsOn;
const invalidWindowIssue = { message: 'תאריך הסיום חייב לחול באותו יום כמו תאריך ההתחלה או אחריו', path: ['endsOn'] };

// Mirrors the `dedications_honorific_memorial_only` CHECK constraint in
// Postgres: a honorific (ז״ל / ע״ה / הי״ד) declares the honoree dead, so it
// is rejected outright, never silently dropped, on a healing or a success
// dedication, where it would print a prayer for a living person's recovery
// alongside a claim that he already died.
const requireHonorificOnlyForMemorial = (value: { type: DedicationType; honorific?: DedicationHonorific | null }): boolean =>
  value.honorific == null || value.type === 'memorial';
const invalidHonorificIssue = {
  message: 'תואר (ז״ל / ע״ה / הי״ד) קביל רק בסוג "לעילוי נשמת"; עבור סוג הקדשה אחר יש להשאיר את שדה התואר ריק',
  path: ['honorific'],
};

// `honoredGender` is unused when there is no `parentName` to put בן/בת in
// front of, so it is optional in that case, but required the moment a
// `parentName` is given: a parent line must never guess the gender.
const requireGenderWhenParentNamePresent = (value: { parentName?: string; honoredGender?: HonoredGender | null }): boolean =>
  value.parentName === undefined || value.honoredGender != null;
const missingGenderIssue = {
  message: 'כאשר מולא שם ההורה (parentName) יש לבחור גם מגדר (honoredGender); ללא שם הורה ניתן להשאיר את שדה המגדר ריק',
  path: ['honoredGender'],
};

export const createDedicationRequestSchema = createDedicationSchema
  .refine(requireValidWindow, invalidWindowIssue)
  .refine(requireHonorificOnlyForMemorial, invalidHonorificIssue)
  .refine(requireGenderWhenParentNamePresent, missingGenderIssue);
export type CreateDedicationInput = z.infer<typeof createDedicationSchema>;

// A full replacement, not a merge, matching `updateLessonSchema`: the
// honorific/gender independence rule and the suffix/type rule are exactly
// the kind of thing a partial merge could violate by leaving a stale field
// behind while another one changes.
export const updateDedicationRequestSchema = createDedicationSchema
  .refine(requireValidWindow, invalidWindowIssue)
  .refine(requireHonorificOnlyForMemorial, invalidHonorificIssue)
  .refine(requireGenderWhenParentNamePresent, missingGenderIssue);
export type UpdateDedicationInput = CreateDedicationInput;

// Derived, never written twice: `.partial()` reuses every field rule above
// as is, then `.required({ type: true })` keeps the one field the composer
// cannot run without. A draft that has only a type and a name is a normal,
// valid preview, never a 400 and never a 500.
export const previewDedicationSchema = createDedicationSchema.partial().required({ type: true });
export type PreviewDedicationInput = z.infer<typeof previewDedicationSchema>;

export const takedownDedicationSchema = z.object({
  reason: z.string().trim().min(1),
});
export type TakedownDedicationInput = z.infer<typeof takedownDedicationSchema>;

// The raw stored fields plus the server-managed id and timestamps, nothing
// derived: `state` and the composed `display` text are added by the
// convertor (`convertors/admin-dedication.ts`), not here, since they depend
// on "now" rather than on the row alone.
export interface DedicationRecord {
  id: string;
  type: DedicationType;
  honoredName: string;
  honorific?: DedicationHonorific;
  honoredGender?: HonoredGender;
  parentName?: string;
  donorFamilyName?: string;
  closingLineEnabled: boolean;
  startsOn: string;
  endsOn: string;
  takenDownReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DedicationListResult {
  items: DedicationRecord[];
  page: number;
  pageSize: number;
  total: number;
}
