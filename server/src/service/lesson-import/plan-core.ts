import type {
  AgentImportCounts,
  AgentImportLessonSummary,
  AgentImportNameQuestion,
  AgentImportNewLink,
  AgentImportNewPlace,
  AgentImportRabbiCandidate,
  AgentImportRowRef,
  AgentImportSkippedRow,
  AgentImportWithheldDeletion,
  LessonAudience,
  Weekday,
} from '@torabarabim/common';

import { todayInIsrael } from '../lesson/israel-time';
import {
  compareCodePoints,
  honorificFromRawName,
  isSynagogueName,
  nameKeyOf,
  onceImportKey,
  parseImportKey,
  placeMatchKeyOf,
  resolveWeekday,
  synagogueDisplayName,
  weekdayOfIsoDate,
  weeklyImportKey,
} from './clean';
import { DELETION_STOP_THRESHOLD, SHARP_DROP_RATIO } from './consts';
import type {
  ExistingLessonSnapshot,
  LessonImportRowInput,
  LinkRecord,
  NormalizedRow,
  PlaceSnapshot,
  PlanCoreInput,
  PlanCoreResult,
  RabbiInfo,
  RabbiResolution,
  ResolvedRowEntry,
  ResolvedVenue,
  ResolvedWrite,
  RowRecurrence,
} from './models';
import { normalizeRow } from './row';

const linkKey = (nameKey: string, source: string): string => `${nameKey}|${source}`;

const rowRecurrenceInfo = (row: LessonImportRowInput): { weekday?: Weekday; date?: string } => {
  const weekday = resolveWeekday(row.weekday);
  return { weekday, date: row.date };
};

const dayOf = (recurrence: RowRecurrence): string => (recurrence.kind === 'weekly' ? `w${recurrence.weekday}` : `d${recurrence.date}`);

// Best-effort keys describing "this source's row for this day", used to
// protect an existing lesson from deletion while a row that might be the
// same lesson is still a question or a skip. Two forms per day: the start
// time (what a lesson is) and the normalised place (how lessons were keyed
// before, and how a row can still be recognised when its time moved).
// Returns [] when the row carries no day information to key on at all.
const protectionKeysForRow = (row: LessonImportRowInput): string[] => {
  const { weekday, date } = rowRecurrenceInfo(row);
  const place = placeMatchKeyOf(row.place);
  const keys: string[] = [];
  for (const source of row.sources) {
    if (date) keys.push(`${source}|d${date}|t${row.startTime}`, `${source}|d${date}|${place}`);
    if (weekday !== undefined) keys.push(`${source}|w${weekday}|t${row.startTime}`, `${source}|w${weekday}|${place}`);
  }
  return keys;
};

// Fail-closed: every extra form here can only keep a lesson alive. A once
// lesson also answers to its weekday's key, so a weekly row that is still a
// question protects it; the place forms cover the lesson's current text and
// the text frozen in an old-form stored key.
const protectionKeysForLesson = (lesson: ExistingLessonSnapshot): string[] => {
  const placeForms = new Set([placeMatchKeyOf(lesson.addressName)]);
  const storedKey = lesson.importKey ? parseImportKey(lesson.importKey) : undefined;
  if (storedKey?.form === 'place') placeForms.add(storedKey.placeMatchKey);

  const days: string[] = [];
  if (lesson.recurrenceKind === 'once' && lesson.recurrenceDate) days.push(`d${lesson.recurrenceDate}`, `w${weekdayOfIsoDate(lesson.recurrenceDate)}`);
  for (const weekday of lesson.recurrenceWeekdays ?? []) days.push(`w${weekday}`);

  const keys: string[] = [];
  for (const source of lesson.importSources ?? []) {
    for (const day of days) {
      keys.push(`${source}|${day}|t${lesson.startTime}`);
      for (const place of placeForms) keys.push(`${source}|${day}|${place}`);
    }
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
  place: lesson.addressName,
  weekday: lesson.recurrenceKind === 'weekly' ? lesson.recurrenceWeekdays?.[0] : undefined,
  date: lesson.recurrenceKind === 'once' ? (lesson.recurrenceDate ?? undefined) : undefined,
  startTime: lesson.startTime,
  sources: lesson.importSources ?? [],
  needsReview: false,
});

const sameSources = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort(compareCodePoints);
  const sortedB = [...b].sort(compareCodePoints);
  return sortedA.every((value, index) => value === sortedB[index]);
};

// True when applying `row` to `lesson` would change nothing visible: the
// idempotency guarantee the owner relies on. The rabbi, the recurrence and
// the start time already match by construction (they are what made the
// lesson a candidate), so the venue and the remaining fields are compared.
// Without this, re-applying the exact same file every week would "update"
// every lesson it had already imported, which is not a real change and must
// not read as one. A place match also compares the city, so a lesson whose
// stored city drifted from its place is repaired by the next run.
const rowMatchesLesson = (row: NormalizedRow, lesson: ExistingLessonSnapshot, venue: ResolvedVenue): boolean => {
  const isSameVenue =
    venue.kind === 'place'
      ? lesson.placeId === venue.placeId && lesson.cityCode === row.cityCode
      : venue.kind === 'address' && lesson.placeId === null && row.place === lesson.addressName && row.street === lesson.addressStreet && row.cityCode === lesson.cityCode;
  return (
    isSameVenue &&
    (row.title ?? null) === lesson.title &&
    (row.topic ?? null) === lesson.topic &&
    row.audience === lesson.audience &&
    row.startTime === lesson.startTime &&
    row.durationMinutes === lesson.durationMinutes &&
    (row.notes ?? null) === lesson.notes &&
    sameSources(row.sources, lesson.importSources ?? [])
  );
};

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
  const { file, rules, links, rabbiCandidatesByNameKey, rabbiById, existingLessons, places, dismissedKeys, resolveCityCode, now } = input;

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
  const protectionKeys = new Set<string>();
  let notImportedRowCount = 0;

  const today = todayInIsrael(now);

  // Existing lessons are indexed by what a lesson is: rabbi, day and start
  // time, read from the columns and never parsed from the stored key, so old
  // and new key forms coexist. A once lesson also answers to its weekday's
  // key, so a weekly row can find it. A one-off dated before today is not
  // indexed at all: a past one-off neither blocks a row nor is replaced by
  // one.
  const weeklyAt = new Map<string, ExistingLessonSnapshot[]>();
  const onceAtDate = new Map<string, ExistingLessonSnapshot[]>();
  const onceOnWeekday = new Map<string, ExistingLessonSnapshot[]>();
  // The stored key is still indexed as well: the unique index on
  // `import_key` forbids a second lesson holding a key, even a lesson whose
  // columns no longer match it (a hand-edited 'imported_edited' lesson keeps
  // the key it was given at import time).
  const lessonsByStoredKey = new Map<string, ExistingLessonSnapshot[]>();
  // Lessons nobody imported, by rabbi and day, for the "same place, another
  // time" hint on an addition.
  const handLessonsByDay = new Map<string, ExistingLessonSnapshot[]>();
  const pushTo = (map: Map<string, ExistingLessonSnapshot[]>, key: string, lesson: ExistingLessonSnapshot): void => {
    const list = map.get(key) ?? [];
    list.push(lesson);
    map.set(key, list);
  };
  for (const lesson of existingLessons) {
    if (lesson.importKey) pushTo(lessonsByStoredKey, lesson.importKey, lesson);
    if (lesson.recurrenceKind === 'weekly') {
      for (const weekday of lesson.recurrenceWeekdays ?? []) {
        pushTo(weeklyAt, weeklyImportKey(lesson.rabbiId, weekday, lesson.startTime), lesson);
        if (lesson.provenance !== 'imported') pushTo(handLessonsByDay, `${lesson.rabbiId}|w${weekday}`, lesson);
      }
    } else if (lesson.recurrenceDate && lesson.recurrenceDate >= today) {
      const weekday = weekdayOfIsoDate(lesson.recurrenceDate);
      pushTo(onceAtDate, onceImportKey(lesson.rabbiId, lesson.recurrenceDate, lesson.startTime), lesson);
      pushTo(onceOnWeekday, weeklyImportKey(lesson.rabbiId, weekday, lesson.startTime), lesson);
      if (lesson.provenance !== 'imported') pushTo(handLessonsByDay, `${lesson.rabbiId}|d${lesson.recurrenceDate}`, lesson);
    }
  }

  // Hand-deleted lessons are remembered in two forms: by rabbi, day and
  // start time (every deletion made since the key carries the time), and by
  // rabbi, day and normalised place (older deletions, kept as they were, so
  // they still block any time at that place on that day).
  const dismissedByTime = new Set<string>();
  const dismissedByPlace = new Set<string>();
  for (const key of dismissedKeys) {
    const parsed = parseImportKey(key);
    if (parsed?.form === 'place') dismissedByPlace.add(`${parsed.rabbiId}|${parsed.day}|${parsed.placeMatchKey}`);
    else dismissedByTime.add(key);
  }

  const placesByMatchKey = new Map<string, PlaceSnapshot[]>();
  for (const place of places) {
    const matchKey = placeMatchKeyOf(place.name);
    if (!matchKey) continue;
    const key = `${matchKey}|${place.cityCode}`;
    const list = placesByMatchKey.get(key) ?? [];
    list.push(place);
    placesByMatchKey.set(key, list);
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

    resolvedEntries.push({ row: resolvedRow, rabbiId, rabbi });
  }

  // Rows naming the same rabbi, day and exact start time are one lesson,
  // whatever place they name. A one-off whose weekday and start time match a
  // weekly row of the same rabbi is absorbed into it: the weekly wins.
  // Nothing else merges: two start times are two lessons, two weekly groups
  // never join, and the place never decides.
  interface RowGroup {
    importKey: string;
    rabbiId: string;
    recurrence: RowRecurrence;
    startTime: string;
    entries: ResolvedRowEntry[];
    absorbed: ResolvedRowEntry[];
  }
  const groups = new Map<string, RowGroup>();
  for (const entry of resolvedEntries) {
    const { recurrence, startTime } = entry.row;
    const importKey = recurrence.kind === 'weekly' ? weeklyImportKey(entry.rabbiId, recurrence.weekday, startTime) : onceImportKey(entry.rabbiId, recurrence.date, startTime);
    const group = groups.get(importKey) ?? { importKey, rabbiId: entry.rabbiId, recurrence, startTime, entries: [], absorbed: [] };
    group.entries.push(entry);
    groups.set(importKey, group);
  }
  for (const group of [...groups.values()]) {
    if (group.recurrence.kind !== 'once') continue;
    const weeklyGroup = groups.get(weeklyImportKey(group.rabbiId, group.recurrence.weekday, group.startTime));
    if (!weeklyGroup) continue;
    weeklyGroup.absorbed.push(...group.entries);
    for (const entry of group.entries) {
      skipped.push({
        source: entry.row.sources.join('+'),
        rabbiName: entry.row.rabbiName,
        reason: 'duplicate_in_file',
        description: `${entry.row.place} ${entry.row.startTime}, covered by a weekly row at the same time`,
      });
    }
    groups.delete(group.importKey);
  }

  // The winner of a group must not depend on file order, or a site that
  // reorders its own rows would flip which place text survives every week.
  const sortedSourcesKey = (entry: ResolvedRowEntry): string => [...entry.row.sources].sort(compareCodePoints).join(',');
  const compareEntries = (a: ResolvedRowEntry, b: ResolvedRowEntry): number =>
    compareCodePoints(sortedSourcesKey(a), sortedSourcesKey(b)) ||
    compareCodePoints(a.row.place, b.row.place) ||
    compareCodePoints(a.row.street, b.row.street) ||
    compareCodePoints(JSON.stringify(a.row.raw), JSON.stringify(b.row.raw));

  const candidatesOf = (group: RowGroup): ExistingLessonSnapshot[] => {
    const { recurrence, rabbiId, startTime, importKey } = group;
    const found =
      recurrence.kind === 'weekly'
        ? [...(weeklyAt.get(importKey) ?? []), ...(onceOnWeekday.get(importKey) ?? [])]
        : [...(onceAtDate.get(importKey) ?? []), ...(weeklyAt.get(weeklyImportKey(rabbiId, recurrence.weekday, startTime)) ?? [])];
    const byId = new Map([...found, ...(lessonsByStoredKey.get(importKey) ?? [])].map((lesson) => [lesson.id, lesson] as const));
    return [...byId.values()].sort((a, b) => compareCodePoints(a.id, b.id));
  };

  const resolveVenue = (row: NormalizedRow): ResolvedVenue => {
    const matchKey = placeMatchKeyOf(row.place);
    if (!matchKey) return { kind: 'address' };
    const placeKey = `${matchKey}|${row.cityCode}`;
    const matches = placesByMatchKey.get(placeKey) ?? [];
    const [onlyMatch] = matches;
    if (matches.length === 1 && onlyMatch?.isActive) return { kind: 'place', placeId: onlyMatch.id };
    // Fail-closed: a deactivated place, or two places of one name, never
    // gets a second place created beside it. The lesson keeps its own
    // address text until a person decides which place is the real one.
    if (matches.length > 0) return { kind: 'address' };
    return isSynagogueName(row.place) ? { kind: 'newPlace', placeKey } : { kind: 'address' };
  };

  const newPlaceUses = new Map<string, { place: string; street: string; cityCode: number }[]>();
  const retainedLessonIds = new Set<string>();
  const claimedLessonIds = new Set<string>();
  const duplicates = new Map<string, { lesson: ExistingLessonSnapshot; kept: ExistingLessonSnapshot }>();
  const markDuplicate = (lesson: ExistingLessonSnapshot, kept: ExistingLessonSnapshot): void => {
    if (!duplicates.has(lesson.id)) duplicates.set(lesson.id, { lesson, kept });
  };

  const samePlaceHandLessonId = (row: NormalizedRow, rabbiId: string): string | undefined => {
    const dayKeys = row.recurrence.kind === 'weekly' ? [`${rabbiId}|w${row.recurrence.weekday}`] : [`${rabbiId}|d${row.recurrence.date}`, `${rabbiId}|w${row.recurrence.weekday}`];
    const placeKey = placeMatchKeyOf(row.place);
    return dayKeys
      .flatMap((key) => handLessonsByDay.get(key) ?? [])
      .filter((lesson) => lesson.cityCode === row.cityCode && placeMatchKeyOf(lesson.addressName) === placeKey)
      .map((lesson) => lesson.id)
      .sort(compareCodePoints)[0];
  };

  for (const group of [...groups.values()].sort((a, b) => compareCodePoints(a.importKey, b.importKey))) {
    const members = [...group.entries].sort(compareEntries);
    const winner = members[0] as ResolvedRowEntry;
    for (const entry of members.slice(1)) {
      skipped.push({ source: entry.row.sources.join('+'), rabbiName: entry.row.rabbiName, reason: 'duplicate_in_file', description: `${entry.row.place} ${entry.row.startTime}` });
    }

    const sources = [...new Set([...group.entries, ...group.absorbed].flatMap((entry) => entry.row.sources))].sort(compareCodePoints);
    const winnerRow: NormalizedRow = { ...winner.row, sources };
    const skipGroup = (reason: string, description: string): void => {
      skipped.push({ source: sources.join('+'), rabbiName: winner.row.rabbiName, reason, description });
    };

    const candidates = candidatesOf(group).filter((lesson) => !claimedLessonIds.has(lesson.id));
    const importedCandidates = candidates.filter((lesson) => lesson.provenance === 'imported');

    const isHandDeleted =
      dismissedByTime.has(group.importKey) ||
      (group.recurrence.kind === 'once' && dismissedByTime.has(weeklyImportKey(group.rabbiId, group.recurrence.weekday, group.startTime))) ||
      [...group.entries, ...group.absorbed].some((entry) => dismissedByPlace.has(`${entry.rabbiId}|${dayOf(entry.row.recurrence)}|${placeMatchKeyOf(entry.row.place)}`));
    if (isHandDeleted) {
      skipGroup('hand_deleted', `${winnerRow.place} ${winnerRow.startTime}`);
      for (const lesson of importedCandidates) retainedLessonIds.add(lesson.id);
      continue;
    }

    const protectedLessons = candidates.filter((lesson) => lesson.provenance !== 'imported');
    const protectedLesson = protectedLessons.find((lesson) => lesson.recurrenceKind === 'weekly') ?? protectedLessons[0];
    if (protectedLesson) {
      skipGroup('matches_existing_lesson', `source place '${winnerRow.place}' ${winnerRow.startTime} vs existing lesson place '${protectedLesson.addressName}' ${protectedLesson.startTime}`);
      for (const lesson of importedCandidates) {
        // Weekly beats once: a weekly lesson is never a twin of a one-off.
        if (protectedLesson.recurrenceKind === 'once' && lesson.recurrenceKind === 'weekly') retainedLessonIds.add(lesson.id);
        else markDuplicate(lesson, protectedLesson);
      }
      continue;
    }

    // A one-off and a weekly lesson at one time are one lesson, and the
    // weekly wins: an existing weekly lesson already covers this row.
    const weeklyCover = group.recurrence.kind === 'once' ? importedCandidates.find((lesson) => lesson.recurrenceKind === 'weekly') : undefined;
    if (weeklyCover) {
      skipGroup('matches_existing_lesson', `source place '${winnerRow.place}' ${winnerRow.startTime} is covered by the weekly lesson at place '${weeklyCover.addressName}' ${weeklyCover.startTime}`);
      retainedLessonIds.add(weeklyCover.id);
      claimedLessonIds.add(weeklyCover.id);
      for (const lesson of importedCandidates) if (lesson !== weeklyCover) markDuplicate(lesson, weeklyCover);
      continue;
    }

    const rank = (lesson: ExistingLessonSnapshot): number => (lesson.recurrenceKind === group.recurrence.kind ? 2 : 0) + (lesson.importKey === group.importKey ? 1 : 0);
    const target = [...importedCandidates].sort((a, b) => rank(b) - rank(a) || compareCodePoints(a.id, b.id))[0];
    if (target) {
      retainedLessonIds.add(target.id);
      claimedLessonIds.add(target.id);
      for (const lesson of importedCandidates) if (lesson !== target) markDuplicate(lesson, target);
    }

    const venue = resolveVenue(winnerRow);
    if (target && rowMatchesLesson(winnerRow, target, venue)) continue;

    if (venue.kind === 'newPlace') {
      const uses = newPlaceUses.get(venue.placeKey) ?? [];
      uses.push({ place: winnerRow.place, street: winnerRow.street, cityCode: winnerRow.cityCode });
      newPlaceUses.set(venue.placeKey, uses);
    }

    const summary = summaryFromRow(winnerRow, { lessonId: target?.id, sources, rabbi: winner.rabbi });
    if (target) {
      updates.push(summary);
    } else {
      const samePlaceLessonId = samePlaceHandLessonId(winnerRow, winner.rabbiId);
      additions.push(samePlaceLessonId ? { ...summary, samePlaceLessonId } : summary);
    }
    resolvedWrites.push({ importKey: group.importKey, rabbiId: winner.rabbiId, row: winnerRow, venue, existingLessonId: target?.id });
  }

  // A lesson kept by one group is never proposed as a duplicate by another.
  for (const id of retainedLessonIds) duplicates.delete(id);

  // One entry per synagogue to create, however many rows and spellings
  // named it; its text comes from the row with the smallest (street, place)
  // so the name does not depend on file order.
  const newPlaces: AgentImportNewPlace[] = [...newPlaceUses.entries()]
    .sort(([a], [b]) => compareCodePoints(a, b))
    .map(([placeKey, uses]) => {
      const chosen = [...uses].sort((a, b) => compareCodePoints(a.street, b.street) || compareCodePoints(a.place, b.place))[0] as (typeof uses)[number];
      return { placeKey, name: synagogueDisplayName(chosen.place), street: chosen.street, cityCode: chosen.cityCode };
    });

  // Deletion candidates: every currently 'imported' lesson (never
  // 'imported_edited', which is protected the same as a hand-entered
  // lesson) that no group of this run kept and that is not a proposed
  // duplicate. A duplicate is held apart on purpose: it never counts toward
  // the ten-deletion stop or the sharp-drop ratio, so it can neither hold an
  // ordinary deletion back nor be released along with one.
  const deletionCandidates = existingLessons.filter((lesson) => {
    if (lesson.provenance !== 'imported' || !lesson.importKey) return false;
    if (retainedLessonIds.has(lesson.id) || duplicates.has(lesson.id)) return false;

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
    if (lesson.provenance !== 'imported' || duplicates.has(lesson.id)) continue;
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

  const duplicateIds = [...duplicates.keys()].sort(compareCodePoints);
  for (const id of duplicateIds) {
    const { lesson, kept } = duplicates.get(id) as { lesson: ExistingLessonSnapshot; kept: ExistingLessonSnapshot };
    const rabbi = rabbiById.get(lesson.rabbiId);
    if (!rabbi) throw new Error(`data inconsistency: lesson '${lesson.id}' references unknown rabbi '${lesson.rabbiId}'`);
    withheldIfUnacked.push({
      ...summaryFromLesson(lesson, rabbi),
      lessonId: lesson.id,
      reason: 'duplicate',
      keptLesson: { ...summaryFromLesson(kept, rabbi), lessonId: kept.id, provenance: kept.provenance },
    });
  }

  const counts: AgentImportCounts = {
    added: additions.length,
    updated: updates.length,
    deleted: deletions.length,
    skipped: skipped.length,
    notImported: notImportedRowCount,
    placesCreated: newPlaces.length,
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
    newPlaces,
  };
};
