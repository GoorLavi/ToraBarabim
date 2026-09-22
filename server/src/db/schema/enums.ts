import type { AgentImportLinkDecision, AgentImportRuleKind, Area, LessonAudience, LessonProvenance, LessonTopic, RabbiHonorific, RabbiProminence } from '@torabarabim/common';
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

// A lesson's provenance. 'manual' is entered by hand (admin or rabbi panel)
// and never touched by the import. 'imported' came from the weekly agent
// and is fair game for the agent to update or delete in place. A hand edit
// to an 'imported' lesson flips it to 'imported_edited', which the import
// then treats as protected (never overwritten) the same way it treats
// 'manual', while still remembering the import_key so a later identical row
// does not create a duplicate.
export const LESSON_PROVENANCES = ['manual', 'imported', 'imported_edited'] as const satisfies readonly LessonProvenance[];

export const LESSON_IMPORT_LINK_DECISIONS = ['linked', 'ignored'] as const satisfies readonly AgentImportLinkDecision[];
export const LESSON_IMPORT_LINK_ORIGINS = ['auto', 'owner'] as const;
export const LESSON_IMPORT_RULE_KINDS = ['city_alias', 'time_kind', 'audience_alias', 'topic_alias'] as const satisfies readonly AgentImportRuleKind[];

export const RABBI_PROMINENCES = ['local', 'known', 'sought'] as const satisfies readonly RabbiProminence[];

export const RABBI_HONORIFICS = ['rav', 'rabbanit'] as const satisfies readonly RabbiHonorific[];

// Not mirrored from `common`: an account's role is a server-side auth
// concept, never a field the client reads or sends. 'place' mirrors 'rabbi':
// an account that manages exactly one place, the same one-account-per-owner
// shape (see `admin_users_place_id_unique`).
export const ADMIN_ROLES = ['admin', 'rabbi', 'place'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

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

// Same mechanism as `rabbiProminenceExhaustivenessCheck` above: catches a
// member added to `RabbiHonorific` in `common` that never made it here.
const rabbiHonorificExhaustivenessCheck: Record<RabbiHonorific, true> = {
  rav: true,
  rabbanit: true,
};
void rabbiHonorificExhaustivenessCheck;

export const areaEnum = pgEnum('area', AREAS);
export const lessonTopicEnum = pgEnum('lesson_topic', LESSON_TOPICS);
export const lessonAudienceEnum = pgEnum('lesson_audience', LESSON_AUDIENCES);
export const recurrenceKindEnum = pgEnum('recurrence_kind', RECURRENCE_KINDS);
export const exceptionKindEnum = pgEnum('exception_kind', EXCEPTION_KINDS);
export const rabbiProminenceEnum = pgEnum('rabbi_prominence', RABBI_PROMINENCES);
export const rabbiHonorificEnum = pgEnum('rabbi_honorific', RABBI_HONORIFICS);
export const adminRoleEnum = pgEnum('admin_role', ADMIN_ROLES);
export const lessonProvenanceEnum = pgEnum('lesson_provenance', LESSON_PROVENANCES);
export const lessonImportLinkDecisionEnum = pgEnum('lesson_import_link_decision', LESSON_IMPORT_LINK_DECISIONS);
export const lessonImportLinkOriginEnum = pgEnum('lesson_import_link_origin', LESSON_IMPORT_LINK_ORIGINS);
export const lessonImportRuleKindEnum = pgEnum('lesson_import_rule_kind', LESSON_IMPORT_RULE_KINDS);
