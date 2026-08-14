import type { Area, LessonAudience, LessonTopic } from '@torabarabim/common';
import { pgEnum } from 'drizzle-orm/pg-core';

// Source of truth for the wire union types, mirrored here because a
// Postgres enum needs its own literal tuple. `satisfies` fails the build if
// a member is added, dropped, or renamed in `common` without updating this.
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

export const areaEnum = pgEnum('area', AREAS);
export const lessonTopicEnum = pgEnum('lesson_topic', LESSON_TOPICS);
export const lessonAudienceEnum = pgEnum('lesson_audience', LESSON_AUDIENCES);
export const recurrenceKindEnum = pgEnum('recurrence_kind', RECURRENCE_KINDS);
export const exceptionKindEnum = pgEnum('exception_kind', EXCEPTION_KINDS);
