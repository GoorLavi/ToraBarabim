import type { Area, LessonAudience, LessonTopic, RabbiProminence } from '@torabarabim/common';
import { pgEnum } from 'drizzle-orm/pg-core';

// Source of truth for the wire union types, mirrored here because a
// Postgres enum needs its own literal tuple. `satisfies` fails the build if
// a member is dropped or renamed in `common` without updating this, but not
// if one is added: a shorter tuple still satisfies a wider union, so an
// added member compiles clean and silently never reaches the enum. See the
// exhaustiveness check next to `RABBI_PROMINENCES` for the mechanism that
// closes that gap.
export const AREAS = [
  'north',
  'haifa',
  'sharon',
  'center',
  'telAviv',
  'jerusalem',
  'shfela',
  'south',
] as const satisfies readonly Area[];

export const LESSON_TOPICS = [
  'gemara',
  'halacha',
  'parasha',
  'mussar',
  'chassidut',
  'tanach',
  'machshava',
  'other',
] as const satisfies readonly LessonTopic[];

export const LESSON_AUDIENCES = ['men', 'women', 'mixed'] as const satisfies readonly LessonAudience[];

export const RECURRENCE_KINDS = ['weekly', 'once'] as const;
export const EXCEPTION_KINDS = ['cancelled', 'modified'] as const;

export const RABBI_PROMINENCES = ['local', 'known', 'sought'] as const satisfies readonly RabbiProminence[];

// `satisfies readonly RabbiProminence[]` above only catches a member being
// renamed or removed from the union: a shorter tuple still satisfies a wider
// union, so a tier added in `common` would compile clean and silently never
// reach this enum. This exhaustiveness check closes that gap: a `Record`
// keyed on the union rejects the moment the union gains a member this object
// does not list.
const rabbiProminenceExhaustivenessCheck: Record<RabbiProminence, true> = {
  local: true,
  known: true,
  sought: true,
};
void rabbiProminenceExhaustivenessCheck;

export const areaEnum = pgEnum('area', AREAS);
export const lessonTopicEnum = pgEnum('lesson_topic', LESSON_TOPICS);
export const lessonAudienceEnum = pgEnum('lesson_audience', LESSON_AUDIENCES);
export const recurrenceKindEnum = pgEnum('recurrence_kind', RECURRENCE_KINDS);
export const exceptionKindEnum = pgEnum('exception_kind', EXCEPTION_KINDS);
export const rabbiProminenceEnum = pgEnum('rabbi_prominence', RABBI_PROMINENCES);
