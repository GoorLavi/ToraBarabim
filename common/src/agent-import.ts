import type { LessonImportFile } from './lesson-import-file';
import type { RabbiHonorific } from './rabbi';

export type LessonProvenance = 'manual' | 'imported' | 'imported_edited';

export interface AgentImportRabbiCandidate {
  id: string;
  name: string;
  honorific: RabbiHonorific;
  title?: string;
  cities: string[];
  photoUrl?: string;
}

export interface AgentImportRowRef {
  place: string;
  city?: string;
  startTime: string;
  weekday: string;
  source: string;
  pageUrl?: string;
}

// A name that did not resolve to exactly one rabbi: zero candidates, two or
// more, or (for a merged row) two links disagreeing. `POST /decisions`
// answers one of these by `nameKey` and `source`.
export interface AgentImportNameQuestion {
  nameKey: string;
  source: string;
  rabbiName: string;
  candidates: AgentImportRabbiCandidate[];
  rows: AgentImportRowRef[];
}

// A resolved lesson always names a real rabbi, so it carries his stored
// name and his honorific as separate fields (never a composed display
// string): the agent's own weekly summary composes the text it shows the
// owner, from these.
export interface AgentImportLessonSummary {
  lessonId?: string;
  rabbiName: string;
  rabbiHonorific: RabbiHonorific;
  place: string;
  city?: string;
  weekday?: number;
  date?: string;
  startTime: string;
  sources: string[];
  needsReview: boolean;
}

export type AgentImportWithheldReason = 'sharp_drop' | 'over_threshold';

export interface AgentImportWithheldDeletion extends AgentImportLessonSummary {
  lessonId: string;
  reason: AgentImportWithheldReason;
  // The subset of `sources` that actually triggered the hold (a merged
  // lesson can carry a source that never caused it). `apply`'s `acks` only
  // releases the hold once every one of these, not merely one of
  // `sources`, has been acknowledged.
  causingSources: string[];
}

export interface AgentImportNewLink {
  nameKey: string;
  source: string;
  rabbiId: string;
  rabbiName: string;
  rabbiHonorific: RabbiHonorific;
}

export interface AgentImportSkippedRow {
  source: string;
  rabbiName: string;
  reason: string;
  description: string;
}

export interface AgentImportCounts {
  added: number;
  updated: number;
  deleted: number;
  skipped: number;
  notImported: number;
}

export interface AgentImportPlanResponse {
  digest: string;
  counts: AgentImportCounts;
  additions: AgentImportLessonSummary[];
  updates: AgentImportLessonSummary[];
  deletions: AgentImportLessonSummary[];
  questions: AgentImportNameQuestion[];
  newLinks: AgentImportNewLink[];
  withheldIfUnacked: AgentImportWithheldDeletion[];
  skipped: AgentImportSkippedRow[];
}

export interface AgentImportRabbiSearchResult {
  items: AgentImportRabbiCandidate[];
  page: number;
  pageSize: number;
  total: number;
}

export type AgentImportRuleKind = 'city_alias' | 'time_kind' | 'audience_alias' | 'topic_alias';

// A remembered (nameKey, source) resolution: linked to a real rabbi, or
// deliberately ignored. Mirrored in `db/schema/enums.ts`'s
// `LESSON_IMPORT_LINK_DECISIONS`.
export type AgentImportLinkDecision = 'linked' | 'ignored';

// `new_rabbi` carries no `honorific`: the import only ever deals with
// rabbis, so it always creates one with honorific 'rav', never a rabbanit.
export type AgentImportDecisionRequest =
  | { kind: 'link'; nameKey: string; source: string; rabbiId: string }
  | { kind: 'ignore'; nameKey: string; source: string; reason?: string }
  | { kind: 'new_rabbi'; nameKey: string; source: string; name: string; title?: string }
  | { kind: 'rule'; ruleKind: AgentImportRuleKind; matchText: string; value: unknown; reason?: string };

export interface AgentImportDecisionResponse {
  newLink?: AgentImportNewLink;
}

export interface AgentImportApplyRequest {
  file: LessonImportFile;
  digest: string;
  // Source domains whose withheld deletions the owner approved for this run.
  acks?: string[];
}

export interface AgentImportApplyResult {
  counts: AgentImportCounts;
  newLinks: AgentImportNewLink[];
  withheld: AgentImportWithheldDeletion[];
  deleted: AgentImportLessonSummary[];
}
