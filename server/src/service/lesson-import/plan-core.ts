import type {
  AgentImportCounts,
  AgentImportLessonSummary,
  AgentImportNameQuestion,
  AgentImportNewLink,
  AgentImportRabbiCandidate,
  AgentImportRowRef,
  AgentImportSkippedRow,
  AgentImportWithheldDeletion,
  LessonAudience,
  Weekday,
} from '@torabarabim/common';

import { honorificFromRawName, nameKeyOf, onceImportKey, placeKeyOf, resolveWeekday, weeklyImportKey } from './clean';
import { DELETION_STOP_THRESHOLD, SHARP_DROP_RATIO } from './consts';
import type {
  ExistingLessonSnapshot,
  LessonImportRowInput,
  LinkRecord,
  NormalizedRow,
  PlanCoreInput,
  PlanCoreResult,
  RabbiInfo,
  RabbiResolution,
  ResolvedRowEntry,
  ResolvedWrite,
} from './models';
import { normalizeRow } from './row';

const linkKey = (nameKey: string, source: string): string => `${nameKey}|${source}`;

const rowRecurrenceInfo = (row: LessonImportRowInput): { weekday?: Weekday; date?: string } => {
  const weekday = resolveWeekday(row.weekday);
  return { weekday, date: row.date };
};

// A best-effort key describing "this source's row for this day at this
// place", used to protect an existing lesson from deletion while a row that
// might be the same lesson is still a question or a skip. Returns [] when
// the row carries no day information to key on at all.
const protectionKeysForRow = (row: LessonImportRowInput): string[] => {
  const { weekday, date } = rowRecurrenceInfo(row);
  const place = placeKeyOf(row.place);
  const keys: string[] = [];
  for (const source of row.sources) {
    if (date) keys.push(`${source}|d${date}|${place}`);
    if (weekday !== undefined) keys.push(`${source}|w${weekday}|${place}`);
  }
  return keys;
};

const protectionKeysForLesson = (lesson: ExistingLessonSnapshot): string[] => {
  const place = placeKeyOf(lesson.placeName);
  const sources = lesson.importSources ?? [];
  const keys: string[] = [];
  for (const source of sources) {
    if (lesson.recurrenceKind === 'once' && lesson.recurrenceDate) keys.push(`${source}|d${lesson.recurrenceDate}|${place}`);
    for (const weekday of lesson.recurrenceWeekdays ?? []) keys.push(`${source}|w${weekday}|${place}`);
  }
  return keys;
};

const summaryFromRow = (row: NormalizedRow, extra: { lessonId?: string; sources: string[]; rabbi: RabbiInfo }): AgentImportLessonSummary => ({
  lessonId: extra.lessonId,
  rabbiName: extra.rabbi.name,
  rabbiHonorific: extra.rabbi.honorific,
  place: row.place,
  weekday: row.recurrence.kind === 'weekly' ? row.recurrence.weekday : undefined,
  date: row.recurrence.kind === 'once' ? row.recurrence.date : undefined,
  startTime: row.startTime,
  sources: extra.sources,
  needsReview: row.needsReview,
});

const summaryFromLesson = (lesson: ExistingLessonSnapshot, rabbi: RabbiInfo): AgentImportLessonSummary => ({
  lessonId: lesson.id,
  rabbiName: rabbi.name,
  rabbiHonorific: rabbi.honorific,
  place: lesson.placeName,
  weekday: lesson.recurrenceKind === 'weekly' ? lesson.recurrenceWeekdays?.[0] : undefined,
  date: lesson.recurrenceKind === 'once' ? (lesson.recurrenceDate ?? undefined) : undefined,
  startTime: lesson.startTime,
  sources: lesson.importSources ?? [],
  needsReview: false,
});

const sameSources = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

// True when applying `row` to `lesson` would change nothing visible: the
// idempotency guarantee the owner relies on. The lesson's `recurrenceKind`
// and weekday/date already match by construction (both hashed into the
// shared `importKey`), so only the remaining fields need comparing. Without
// this, re-applying the exact same file every week would "update" every
// lesson it had already imported, which is not a real change and must not
// read as one.
const rowMatchesLesson = (row: NormalizedRow, lesson: ExistingLessonSnapshot): boolean =>
  (row.title ?? null) === lesson.title &&
  row.place === lesson.placeName &&
  row.street === lesson.placeStreet &&
  row.cityCode === lesson.cityCode &&
  (row.topic ?? null) === lesson.topic &&
  row.audience === lesson.audience &&
  row.startTime === lesson.startTime &&
  row.durationMinutes === lesson.durationMinutes &&
  (row.notes ?? null) === lesson.notes &&
  sameSources(row.sources, lesson.importSources ?? []);

const resolveRabbiForRow = (
  nameKey: string,
  sources: string[],
  links: Map<string, LinkRecord>,
  rabbiCandidatesByNameKey: Map<string, AgentImportRabbiCandidate[]>,
): RabbiResolution => {
  const sourceLinks = sources.map((source) => links.get(linkKey(nameKey, source))).filter((link): link is LinkRecord => link !== undefined);
  const linkedIds = new Set(
    sourceLinks.filter((link): link is Extract<LinkRecord, { decision: 'linked' }> => link.decision === 'linked').map((link) => link.rabbiId),
  );
  if (linkedIds.size > 1) return { status: 'question', candidates: [] };
  if (linkedIds.size === 1) return { status: 'resolved', rabbiId: [...linkedIds][0] as string };
  if (sourceLinks.some((link) => link.decision === 'ignored')) return { status: 'ignored' };

  // The import only ever deals with rabbis: a rabbanit is never a
  // candidate, and never an automatic link target. A row whose own text
  // named "הרבנית X" never reaches this function at all (see the
  // `rabbanit_not_imported` skip in `planCore`).
  const candidates = (rabbiCandidatesByNameKey.get(nameKey) ?? []).filter((candidate) => candidate.honorific === 'rav');
  if (candidates.length === 1) return { status: 'auto', rabbiId: candidates[0]?.id as string };
  return { status: 'question', candidates };
};

const rowRefFor = (row: NormalizedRow, source: string): AgentImportRowRef => ({
  place: row.place,
  city: row.raw.city,
  startTime: row.startTime,
  weekday: row.raw.weekday,
  source,
  pageUrl: row.raw.pageUrl,
});

// Pure: given the file (already Zod-validated) and everything the database
// knows (rules, links, rabbi candidates, existing lessons, dismissed keys),
// decides the whole run: additions, updates, deletions, questions, new
// links, withheld deletions, and skips. No query, no clock read beyond the
// `now` passed in.
export const planCore = (input: PlanCoreInput): PlanCoreResult => {
  const { file, rules, links, rabbiCandidatesByNameKey, rabbiById, existingLessons, dismissedKeys, resolveCityCode, now } = input;

  const sourceMetaByDomain = new Map(file.sources.map((source) => [source.domain, source] as const));
  // The zero-row guard trusts what the file's `rows` actually contain for a
  // source, never the source's own declared `rowCount`: a wrong declared
  // count must never let a genuinely broken source through the guard, and
  // must never block a genuinely healthy one either (fail closed on the
  // guard itself, not on the file).
  const actualRowCountByDomain = new Map<string, number>();
  for (const row of file.rows) {
    for (const source of row.sources) actualRowCountByDomain.set(source, (actualRowCountByDomain.get(source) ?? 0) + 1);
  }

  const additions: AgentImportLessonSummary[] = [];
  const updates: AgentImportLessonSummary[] = [];
  // Grouped by (nameKey, single source): several rows (repeat lessons by
  // the same rabbi at the same site) share one decision, so they must
  // share one question and one new-link entry too, not one each. A merged
  // row (several sources) files one question per source it names, never a
  // joined 'a+b' pseudo-source, since `decide` only ever answers one real
  // source at a time. `notImportedRowCount` stays a plain row count
  // regardless of grouping.
  const questionsByPair = new Map<string, AgentImportNameQuestion>();
  const newLinksByPair = new Map<string, AgentImportNewLink>();
  const skipped: AgentImportSkippedRow[] = [];
  const resolvedWrites: ResolvedWrite[] = [];
  const matchedKeys = new Set<string>();
  const protectionKeys = new Set<string>();
  let notImportedRowCount = 0;

  // Indexed by each lesson's own stored `importKey` (never recomputed from
  // its current text): a hand-edited 'imported_edited' lesson keeps the
  // `importKey` it was given at import time even after its place name
  // changes, and the unique index still enforces that key is taken. A row
  // that still produces that same key must be recognised as "this key is
  // already held", not attempted as a fresh insert. A 'manual' lesson has
  // no stored key, so its key is synthesised from its current text purely
  // to catch "this row already matches a hand-entered lesson".
  const keyToLessons = new Map<string, ExistingLessonSnapshot[]>();
  for (const lesson of existingLessons) {
    const keys =
      lesson.provenance !== 'manual' && lesson.importKey
        ? [lesson.importKey]
        : lesson.recurrenceKind === 'once' && lesson.recurrenceDate
          ? [onceImportKey(lesson.rabbiId, lesson.recurrenceDate, lesson.placeName)]
          : (lesson.recurrenceWeekdays ?? []).map((weekday) => weeklyImportKey(lesson.rabbiId, weekday, lesson.placeName));
    for (const key of keys) {
      const existing = keyToLessons.get(key) ?? [];
      existing.push(lesson);
      keyToLessons.set(key, existing);
    }
  }

  const resolvedEntries: ResolvedRowEntry[] = [];

  for (const row of file.rows) {
    const normalized = normalizeRow(row, rules, resolveCityCode, now);
    if ('reason' in normalized) {
      skipped.push({ source: row.sources.join('+'), rabbiName: row.rabbiName, reason: normalized.reason, description: `${row.place} ${row.startTime}` });
      for (const key of protectionKeysForRow(row)) protectionKeys.add(key);
      continue;
    }

    // The import only ever deals with rabbis, never rabbaniyot (owner
    // decision): a row whose own text names "הרבנית X" is skipped outright,
    // before resolution is even attempted, but still protects an existing
    // lesson at its key the same as any other skip.
    if (honorificFromRawName(normalized.rabbiName) === 'rabbanit') {
      skipped.push({ source: normalized.sources.join('+'), rabbiName: normalized.rabbiName, reason: 'rabbanit_not_imported', description: `${row.place} ${row.startTime}` });
      for (const key of protectionKeysForRow(row)) protectionKeys.add(key);
      continue;
    }

    const nameKey = nameKeyOf(normalized.rabbiName);
    const resolution = resolveRabbiForRow(nameKey, normalized.sources, links, rabbiCandidatesByNameKey);

    if (resolution.status === 'ignored') {
      // Section 6: an ignored name is absent, exactly like a row that
      // never appeared. Its key is not exempted from deletion the way a
      // question's is: an ignore is a decision, not an open question.
      skipped.push({ source: normalized.sources.join('+'), rabbiName: normalized.rabbiName, reason: 'name_ignored', description: `${row.place} ${row.startTime}` });
      continue;
    }

    if (resolution.status === 'question') {
      for (const source of normalized.sources) {
        const pairKey = `${nameKey}|${source}`;
        const rowRef = rowRefFor(normalized, source);
        const existingQuestion = questionsByPair.get(pairKey);
        if (existingQuestion) existingQuestion.rows.push(rowRef);
        else questionsByPair.set(pairKey, { nameKey, source, rabbiName: normalized.rabbiName, candidates: resolution.candidates, rows: [rowRef] });
      }
      notImportedRowCount += 1;
      for (const key of protectionKeysForRow(row)) protectionKeys.add(key);
      continue;
    }

    const rabbiId = resolution.rabbiId;
    const rabbi = rabbiById.get(rabbiId);
    if (!rabbi) {
      skipped.push({ source: normalized.sources.join('+'), rabbiName: normalized.rabbiName, reason: 'unknown_rabbi', description: `${row.place} ${row.startTime}` });
      continue;
    }

    if (resolution.status === 'auto') {
      for (const source of normalized.sources) {
        newLinksByPair.set(`${nameKey}|${source}`, {
          nameKey,
          source,
          rabbiId,
          rabbiName: rabbi.name,
          rabbiHonorific: rabbi.honorific,
        });
      }
    }

    // Unstated is the owner's default, men (every resolved rabbi here is a
    // rav; a rav's lesson can still be for women when the row says so).
    const resolvedRow: NormalizedRow = { ...normalized, audience: normalized.audience ?? ('men' satisfies LessonAudience) };

    const importKey =
      resolvedRow.recurrence.kind === 'weekly'
        ? weeklyImportKey(rabbiId, resolvedRow.recurrence.weekday, resolvedRow.place)
        : onceImportKey(rabbiId, resolvedRow.recurrence.date, resolvedRow.place);

    resolvedEntries.push({ row: resolvedRow, rabbiId, rabbi, importKey });
  }

  // Group resolved rows by import key: the owner's rule is one lesson per
  // rabbi, per day, per place. Two rows landing on the same key within one
  // file both name that slot (same rabbi, place and day, typically a
  // different time); the winner must not depend on file order, or a site
  // that reorders its own rows would flip which one survives every week.
  // The earliest start time wins; a tie (identical start times too) breaks
  // on the sources sorted and joined, itself independent of the order the
  // row's own `sources` array happened to list them in. The loser is
  // skipped, never a second write that would only fail the unique index.
  // Either way the key is "present" this run, so it never reads as a
  // missing lesson to delete.
  const entriesByImportKey = new Map<string, ResolvedRowEntry[]>();
  for (const entry of resolvedEntries) {
    const list = entriesByImportKey.get(entry.importKey) ?? [];
    list.push(entry);
    entriesByImportKey.set(entry.importKey, list);
  }

  const sortedSourcesKey = (entry: ResolvedRowEntry): string => [...entry.row.sources].sort().join(',');
  const compareEntries = (a: ResolvedRowEntry, b: ResolvedRowEntry): number => {
    if (a.row.startTime !== b.row.startTime) return a.row.startTime < b.row.startTime ? -1 : 1;
    const sourcesA = sortedSourcesKey(a);
    const sourcesB = sortedSourcesKey(b);
    return sourcesA < sourcesB ? -1 : sourcesA > sourcesB ? 1 : 0;
  };

  for (const [importKey, entries] of entriesByImportKey) {
    matchedKeys.add(importKey);
    const winner = entries.reduce((best, current) => (compareEntries(current, best) < 0 ? current : best));

    for (const entry of entries) {
      if (entry !== winner) {
        skipped.push({
          source: entry.row.sources.join('+'),
          rabbiName: entry.row.rabbiName,
          reason: 'duplicate_in_file',
          description: `${entry.row.place} ${entry.row.startTime}`,
        });
      }
    }

    const rabbi = winner.rabbi;

    if (dismissedKeys.has(importKey)) {
      skipped.push({ source: winner.row.sources.join('+'), rabbiName: winner.row.rabbiName, reason: 'hand_deleted', description: `${winner.row.place} ${winner.row.startTime}` });
      continue;
    }

    const candidatesAtKey = keyToLessons.get(importKey) ?? [];
    const protectedMatch = candidatesAtKey.find((lesson) => lesson.provenance !== 'imported');
    if (protectedMatch) {
      skipped.push({
        source: winner.row.sources.join('+'),
        rabbiName: winner.row.rabbiName,
        reason: 'matches_existing_lesson',
        description: `source place '${winner.row.place}' vs existing lesson place '${protectedMatch.placeName}'`,
      });
      continue;
    }

    const importedMatch = candidatesAtKey.find((lesson) => lesson.provenance === 'imported');
    if (importedMatch && rowMatchesLesson(winner.row, importedMatch)) {
      // Same file, same lesson, nothing to write: `matchedKeys` above
      // already protects it from deletion, and that is the only effect
      // an unchanged row should have.
      continue;
    }

    const summary = summaryFromRow(winner.row, { lessonId: importedMatch?.id, sources: winner.row.sources, rabbi });
    if (importedMatch) updates.push(summary);
    else additions.push(summary);
    resolvedWrites.push({ importKey, rabbiId: winner.rabbiId, row: winner.row, existingLessonId: importedMatch?.id });
  }

  // Deletion candidates: every currently 'imported' lesson (never
  // 'imported_edited', which is protected the same as a hand-entered
  // lesson) whose import key this run did not touch.
  const deletionCandidates = existingLessons.filter((lesson) => {
    if (lesson.provenance !== 'imported' || !lesson.importKey) return false;
    if (matchedKeys.has(lesson.importKey)) return false;

    const sources = lesson.importSources ?? [];
    const missingOrGuardedSource = sources.some((source) => {
      const meta = sourceMetaByDomain.get(source);
      return !meta || meta.status === 'failed' || (actualRowCountByDomain.get(source) ?? 0) === 0;
    });
    if (missingOrGuardedSource) return false;

    return !protectionKeysForLesson(lesson).some((key) => protectionKeys.has(key));
  });

  const existingCountBySource = new Map<string, number>();
  for (const lesson of existingLessons) {
    if (lesson.provenance !== 'imported') continue;
    for (const source of lesson.importSources ?? []) existingCountBySource.set(source, (existingCountBySource.get(source) ?? 0) + 1);
  }
  const deletionCountBySource = new Map<string, number>();
  for (const lesson of deletionCandidates) {
    for (const source of lesson.importSources ?? []) deletionCountBySource.set(source, (deletionCountBySource.get(source) ?? 0) + 1);
  }

  const overThreshold = deletionCandidates.length > DELETION_STOP_THRESHOLD;
  const withheldSources = new Set<string>();
  if (overThreshold) {
    for (const source of deletionCountBySource.keys()) withheldSources.add(source);
  } else {
    for (const [source, count] of deletionCountBySource) {
      const existingCount = existingCountBySource.get(source) ?? 0;
      if (existingCount > 0 && count / existingCount > SHARP_DROP_RATIO) withheldSources.add(source);
    }
  }

  const deletions: AgentImportLessonSummary[] = [];
  const withheldIfUnacked: AgentImportWithheldDeletion[] = [];

  for (const lesson of deletionCandidates) {
    const sources = lesson.importSources ?? [];
    const causingSources = sources.filter((source) => withheldSources.has(source));
    const rabbi = rabbiById.get(lesson.rabbiId);
    // A lesson's `rabbiId` is a foreign key to `rabbis`; a miss here is a
    // real data inconsistency, never a reason to invent a honorific.
    if (!rabbi) throw new Error(`data inconsistency: lesson '${lesson.id}' references unknown rabbi '${lesson.rabbiId}'`);
    const summary = summaryFromLesson(lesson, rabbi);
    if (causingSources.length > 0) {
      withheldIfUnacked.push({ ...summary, lessonId: lesson.id, reason: overThreshold ? 'over_threshold' : 'sharp_drop', causingSources });
    } else {
      deletions.push(summary);
    }
  }

  const counts: AgentImportCounts = {
    added: additions.length,
    updated: updates.length,
    deleted: deletions.length,
    skipped: skipped.length,
    notImported: notImportedRowCount,
  };

  return {
    counts,
    additions,
    updates,
    deletions,
    questions: [...questionsByPair.values()],
    newLinks: [...newLinksByPair.values()],
    withheldIfUnacked,
    skipped,
    resolvedWrites,
  };
};
