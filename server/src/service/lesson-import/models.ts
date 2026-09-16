import type {
  AgentImportCounts,
  AgentImportDecisionRequest,
  AgentImportLessonSummary,
  AgentImportNameQuestion,
  AgentImportNewLink,
  AgentImportRabbiCandidate,
  AgentImportSkippedRow,
  AgentImportWithheldDeletion,
  LessonAudience,
  LessonProvenance,
  LessonTopic,
  RabbiHonorific,
  Weekday,
} from '@torabarabim/common';
import { z } from 'zod';

import type { db, Tx } from '../../db/client';
import { LESSON_AUDIENCES, LESSON_IMPORT_RULE_KINDS, LESSON_TOPICS, RECURRENCE_KINDS } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';
import { timeOfDaySchema } from '../shared/time';
import { MAX_ROWS, SOURCE_STATUSES } from './consts';

// A URL with only http/https, per section 6 ("source links only http/https").
const sourceUrlSchema = z.url().refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
  message: 'expected an http or https URL',
});

const sourceSchema = z.object({
  domain: z.string().trim().min(1),
  name: z.string().trim().min(1),
  url: sourceUrlSchema,
  format: z.string().trim().min(1),
  declaredRange: z.string().trim().min(1).optional(),
  status: z.enum(SOURCE_STATUSES),
  failureReason: z.string().trim().min(1).optional(),
  rowCount: z.number().int().min(0),
});

const rowSchema = z.object({
  rabbiName: z.string().trim().min(1),
  date: z.iso.date().optional(),
  weekday: z.string().trim().min(1),
  hebrewDate: z.string().trim().min(1).optional(),
  startTime: timeOfDaySchema,
  timeKind: z.string().trim().min(1),
  endTime: timeOfDaySchema.optional(),
  deliveryType: z.string().trim().min(1),
  city: z.string().trim().min(1).optional(),
  place: z.string().trim().min(1),
  street: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  recurrence: z.string().trim().min(1).optional(),
  audience: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
  sources: z.array(z.string().trim().min(1)).min(1),
  pageUrl: sourceUrlSchema.optional(),
  needsReview: z.boolean(),
});

const droppedRowSchema = z.object({
  source: z.string().trim().min(1),
  description: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export const lessonImportFileSchema = z.object({
  schemaVersion: z.literal(1),
  collectedAt: z.iso.datetime({ offset: true }).or(z.iso.datetime()),
  week: z.string().trim().min(1),
  sources: z.array(sourceSchema),
  rows: z.array(rowSchema).max(MAX_ROWS),
  dropped: z.array(droppedRowSchema),
});
export type LessonImportFileInput = z.infer<typeof lessonImportFileSchema>;
export type LessonImportRowInput = z.infer<typeof rowSchema>;
export type LessonImportSourceInput = z.infer<typeof sourceSchema>;

export const planRequestSchema = lessonImportFileSchema;

export const agentRabbiListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type AgentRabbiListQuery = z.infer<typeof agentRabbiListQuerySchema>;

const cityAliasValueSchema = z.object({ cityCode: z.number().int().positive() });
const timeKindValueSchema = z.object({ note: z.string().trim().min(1).optional() });
const audienceAliasValueSchema = z.object({ audience: z.enum(LESSON_AUDIENCES) });
const topicAliasValueSchema = z.object({ topic: z.enum(LESSON_TOPICS) });

// Each rule kind carries its own value shape; a Postgres CHECK cannot
// express that, so it is enforced here, on the one write path
// (`decide`) that ever creates a rule row.
export const ruleValueSchemaFor = (kind: string) => {
  switch (kind) {
    case 'city_alias':
      return cityAliasValueSchema;
    case 'time_kind':
      return timeKindValueSchema;
    case 'audience_alias':
      return audienceAliasValueSchema;
    case 'topic_alias':
      return topicAliasValueSchema;
    default:
      return z.never();
  }
};

// A source is always exactly one domain, never several joined with '+':
// that joined form only ever appears in a *display* string (a merged
// row's `AgentImportLessonSummary.sources.join('+')` for a human to read),
// and a decision must name the one (nameKey, source) pair it resolves.
const singleSourceSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !value.includes('+'), { message: "expected a single source domain, not several joined with '+'" });

export const decisionRequestSchema: z.ZodType<AgentImportDecisionRequest> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('link'), nameKey: z.string().trim().min(1), source: singleSourceSchema, rabbiId: z.string().trim().min(1) }),
  z.object({
    kind: z.literal('ignore'),
    nameKey: z.string().trim().min(1),
    source: singleSourceSchema,
    reason: z.string().trim().min(1).optional(),
  }),
  z.object({
    kind: z.literal('new_rabbi'),
    nameKey: z.string().trim().min(1),
    source: singleSourceSchema,
    name: z.string().trim().min(1),
    // No `honorific`: the import only ever deals with rabbis, so
    // `new_rabbi` always creates one with honorific 'rav'. `.strict()` makes
    // a stray honorific a 400 instead of a silently created rav, since the
    // honorific can never be changed afterwards (0026).
    title: z.string().trim().min(1).optional(),
  }).strict(),
  z.object({
    kind: z.literal('rule'),
    ruleKind: z.enum(LESSON_IMPORT_RULE_KINDS),
    matchText: z.string().trim().min(1),
    value: z.unknown(),
    reason: z.string().trim().min(1).optional(),
  }),
]);

export const applyRequestSchema = z.object({
  file: lessonImportFileSchema,
  digest: z.string().trim().min(1),
  acks: z.array(z.string().trim().min(1)).optional(),
});
export type ApplyRequestInput = z.infer<typeof applyRequestSchema>;

// --- Types shared across `clean.ts`, `row.ts`, `plan-core.ts` and
// `lesson-import.ts`. Centralised here rather than declared next to the
// function that happens to use them first, per the house convention.

// A rule the owner approved once, grouped by kind, keyed by its cleaned
// `matchText`. Built once per plan/apply from the database, read many
// times during the pure planning pass.
export interface LearnedRules {
  cityAlias: Map<string, { cityCode: number }>;
  timeKind: Map<string, { note?: string }>;
  audienceAlias: Map<string, LessonAudience>;
  topicAlias: Map<string, LessonTopic>;
}

export type RowRecurrence = { kind: 'weekly'; weekday: Weekday } | { kind: 'once'; date: string; weekday: Weekday };

// A row that passed every check in section 6 and is ready to become (or
// update) a lesson, pending only rabbi resolution.
export interface NormalizedRow {
  raw: LessonImportRowInput;
  rabbiName: string;
  place: string;
  street: string;
  cityCode: number;
  title?: string;
  topic?: LessonTopic;
  // `undefined` when the row's own text gave no audience at all (section
  // 6): resolved to the owner's default (men) once the row's rabbi is
  // known. Always definite by the time a row becomes a `ResolvedWrite`.
  audience?: LessonAudience;
  recurrence: RowRecurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
  sources: string[];
  needsReview: boolean;
}

export interface SkippedRow {
  raw: LessonImportRowInput;
  reason: string;
}

// A lesson snapshot as `planCore` needs it: every field the planner might
// compare a row against, plus enough of its identity to match, protect,
// or delete it. Loaded once per plan/apply, never queried per row.
export interface ExistingLessonSnapshot {
  id: string;
  rabbiId: string;
  title: string | null;
  placeName: string;
  placeStreet: string;
  cityCode: number;
  topic: LessonTopic | null;
  audience: LessonAudience;
  provenance: LessonProvenance;
  importKey: string | null;
  importSources: string[] | null;
  recurrenceKind: (typeof RECURRENCE_KINDS)[number];
  recurrenceWeekdays: Weekday[] | null;
  recurrenceDate: string | null;
  startTime: string;
  durationMinutes: number;
  notes: string | null;
}

// Matches the `lesson_import_rabbi_links_decision_shape` CHECK exactly:
// 'linked' always carries a rabbiId, 'ignored' never does.
export type LinkRecord = { rabbiId: string; decision: 'linked' } | { rabbiId: null; decision: 'ignored' };

// A rabbi as `planCore` needs it: enough to resolve a name and filter
// candidates to rabbis only, without a second lookup.
export interface RabbiInfo {
  id: string;
  name: string;
  honorific: RabbiHonorific;
}

export interface PlanCoreInput {
  file: LessonImportFileInput;
  rules: LearnedRules;
  links: Map<string, LinkRecord>;
  rabbiCandidatesByNameKey: Map<string, AgentImportRabbiCandidate[]>;
  rabbiById: Map<string, RabbiInfo>;
  existingLessons: ExistingLessonSnapshot[];
  dismissedKeys: Set<string>;
  resolveCityCode: (cleanedCityName: string) => number | undefined;
  now: Date;
}

export interface ResolvedWrite {
  importKey: string;
  rabbiId: string;
  row: NormalizedRow;
  existingLessonId?: string;
}

// A row that resolved to a real rabbi, before the duplicate-import-key
// tie-break decides which of possibly several such rows for the same key
// wins. Carries `rabbi` directly (fetched once, when the row resolved),
// so the tie-break and the write it produces never re-look it up.
export interface ResolvedRowEntry {
  row: NormalizedRow;
  rabbiId: string;
  rabbi: RabbiInfo;
  importKey: string;
}

export interface PlanCoreResult {
  counts: AgentImportCounts;
  additions: AgentImportLessonSummary[];
  updates: AgentImportLessonSummary[];
  deletions: AgentImportLessonSummary[];
  questions: AgentImportNameQuestion[];
  newLinks: AgentImportNewLink[];
  withheldIfUnacked: AgentImportWithheldDeletion[];
  skipped: AgentImportSkippedRow[];
  resolvedWrites: ResolvedWrite[];
}

// Whether (and to whom) a row's rabbi name resolved. A discriminated union
// on `status`, so a caller narrows before ever reading `rabbiId`, instead
// of trusting an `as string` cast.
export type RabbiResolution =
  | { status: 'resolved'; rabbiId: string }
  | { status: 'auto'; rabbiId: string }
  | { status: 'question'; candidates: AgentImportRabbiCandidate[] }
  | { status: 'ignored' };

// Everything a plan or an apply needs from the database, loaded once.
export interface PlanContext {
  fileSha256: string;
  planResult: PlanCoreResult;
}

// Either the shared pool or an open transaction: `plan` reads through the
// pool, but `apply` must re-plan through the same transaction it writes
// in, or a concurrent write between the read and the write would never be
// caught by the digest check.
export type DbExecutor = typeof db | Tx;
