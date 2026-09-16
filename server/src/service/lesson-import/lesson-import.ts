import type {
  AgentImportApplyResult,
  AgentImportDecisionRequest,
  AgentImportDecisionResponse,
  AgentImportNewLink,
  AgentImportPlanResponse,
  AgentImportRabbiCandidate,
  AgentImportRabbiSearchResult,
  LessonAudience,
  LessonTopic,
} from '@torabarabim/common';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessonImportDismissedKeys, lessonImportRabbiLinks, lessonImportRules, lessonImportRuns, lessons, rabbis } from '../../db/schema';
import { rabbiNameSchema } from '../shared/name';
import { toRabbiSummary } from '../shared/rabbi-summary';
import { cleanCityText, nameKeyOf } from './clean';
import { BUILT_IN_AUDIENCE_ALIASES, BUILT_IN_CITY_ALIASES, BUILT_IN_TIME_KIND_NOTES, BUILT_IN_TOPIC_ALIASES, IMPORT_ADVISORY_LOCK_KEY, UNIQUE_VIOLATION } from './consts';
import { computeDigest, sha256Of } from './digest';
import {
  AlreadyDecidedError,
  ImportBusyError,
  LinkTargetIsRabbanitError,
  PlanChangedError,
  RuleCoversBuiltInError,
  UnknownCityCodeError,
  UnknownRabbiError,
} from './errors';
import type {
  AgentRabbiListQuery,
  ApplyRequestInput,
  DbExecutor,
  ExistingLessonSnapshot,
  LessonImportFileInput,
  LearnedRules,
  LinkRecord,
  PlanContext,
  RabbiInfo,
  ResolvedWrite,
} from './models';
import { ruleValueSchemaFor } from './models';
import { planCore } from './plan-core';
import { emptyLearnedRules } from './row';

// drizzle-orm's postgres-js driver wraps the driver error in its own
// `DrizzleQueryError`, with the real `PostgresError` (and its SQLSTATE
// `code`) on `.cause`, not on the thrown error itself.
const isUniqueViolation = (error: unknown): boolean => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError && cause.code === UNIQUE_VIOLATION;
};

const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const loadRules = async (executor: DbExecutor): Promise<LearnedRules> => {
  const rows = await executor.select().from(lessonImportRules);
  const rules = emptyLearnedRules();
  for (const row of rows) {
    if (row.kind === 'city_alias') rules.cityAlias.set(row.matchText, row.value as { cityCode: number });
    else if (row.kind === 'time_kind') rules.timeKind.set(row.matchText, row.value as { note?: string });
    else if (row.kind === 'audience_alias') rules.audienceAlias.set(row.matchText, (row.value as { audience: LessonAudience }).audience);
    else if (row.kind === 'topic_alias') rules.topicAlias.set(row.matchText, (row.value as { topic: LessonTopic }).topic);
  }
  return rules;
};

const loadLinks = async (executor: DbExecutor): Promise<Map<string, LinkRecord>> => {
  const rows = await executor.select().from(lessonImportRabbiLinks);
  return new Map(
    rows.map((row) => {
      // Matches the `lesson_import_rabbi_links_decision_shape` CHECK: a
      // 'linked' row always carries a rabbiId, so this is a description of
      // stored data, not an assumption.
      const record: LinkRecord = row.decision === 'linked' ? { rabbiId: row.rabbiId as string, decision: 'linked' } : { rabbiId: null, decision: 'ignored' };
      return [`${row.nameKey}|${row.source}`, record] as const;
    }),
  );
};

const loadDismissedKeys = async (executor: DbExecutor): Promise<Set<string>> => {
  const rows = await executor.select({ importKey: lessonImportDismissedKeys.importKey }).from(lessonImportDismissedKeys);
  return new Set(rows.map((row) => row.importKey));
};

const loadCityLookup = async (executor: DbExecutor): Promise<Map<string, number>> => {
  const rows = await executor.select({ code: cities.code, nameHe: cities.nameHe }).from(cities);
  return new Map(rows.map((row) => [row.nameHe, row.code] as const));
};

const loadExistingLessons = async (executor: DbExecutor): Promise<ExistingLessonSnapshot[]> => {
  const rows = await executor
    .select({
      id: lessons.id,
      rabbiId: lessons.rabbiId,
      title: lessons.title,
      placeName: lessons.placeName,
      placeStreet: lessons.placeStreet,
      cityCode: lessons.cityCode,
      topic: lessons.topic,
      audience: lessons.audience,
      provenance: lessons.provenance,
      importKey: lessons.importKey,
      importSources: lessons.importSources,
      recurrenceKind: lessons.recurrenceKind,
      recurrenceWeekdays: lessons.recurrenceWeekdays,
      recurrenceDate: lessons.recurrenceDate,
      startTime: lessons.startTime,
      durationMinutes: lessons.durationMinutes,
      notes: lessons.notes,
    })
    .from(lessons);
  return rows as ExistingLessonSnapshot[];
};

const loadCitiesByRabbi = async (executor: DbExecutor, rabbiIds?: string[]): Promise<Map<string, string[]>> => {
  // A raw `sql`... = any(${ids})`` interpolates the JS array as a
  // Postgres tuple, not an array literal, and fails outright: Drizzle's
  // `inArray` is what actually builds `= any(array[...])`. An explicit
  // empty array short-circuits rather than sending `IN ()` (which some
  // drivers mishandle) for the common case of a page with no rows yet.
  if (rabbiIds && rabbiIds.length === 0) return new Map();
  const condition = rabbiIds ? inArray(lessons.rabbiId, rabbiIds) : undefined;
  const rows = await executor
    .select({ rabbiId: lessons.rabbiId, cityName: cities.nameHe })
    .from(lessons)
    .innerJoin(cities, eq(lessons.cityCode, cities.code))
    .where(condition);

  const citiesByRabbi = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = citiesByRabbi.get(row.rabbiId) ?? new Set<string>();
    set.add(row.cityName);
    citiesByRabbi.set(row.rabbiId, set);
  }
  return new Map([...citiesByRabbi.entries()].map(([rabbiId, set]) => [rabbiId, [...set]] as const));
};

const loadRabbiCandidates = async (
  executor: DbExecutor,
): Promise<{ byNameKey: Map<string, AgentImportRabbiCandidate[]>; byId: Map<string, RabbiInfo> }> => {
  const [rabbiRows, citiesByRabbi] = await Promise.all([executor.select().from(rabbis), loadCitiesByRabbi(executor)]);

  const byNameKey = new Map<string, AgentImportRabbiCandidate[]>();
  const byId = new Map<string, RabbiInfo>();
  for (const row of rabbiRows) {
    byId.set(row.id, { id: row.id, name: row.name, honorific: row.honorific });
    const candidate: AgentImportRabbiCandidate = {
      id: row.id,
      name: row.name,
      honorific: row.honorific,
      title: row.title ?? undefined,
      cities: citiesByRabbi.get(row.id) ?? [],
      photoUrl: row.photoUrl ?? undefined,
    };
    const key = nameKeyOf(row.name);
    const list = byNameKey.get(key) ?? [];
    list.push(candidate);
    byNameKey.set(key, list);
  }
  return { byNameKey, byId };
};

const buildPlan = async (file: LessonImportFileInput, executor: DbExecutor): Promise<PlanContext> => {
  const [rules, links, dismissedKeys, cityByName, existingLessons, rabbiInfo] = await Promise.all([
    loadRules(executor),
    loadLinks(executor),
    loadDismissedKeys(executor),
    loadCityLookup(executor),
    loadExistingLessons(executor),
    loadRabbiCandidates(executor),
  ]);

  const planResult = planCore({
    file,
    rules,
    links,
    rabbiCandidatesByNameKey: rabbiInfo.byNameKey,
    rabbiById: rabbiInfo.byId,
    existingLessons,
    dismissedKeys,
    resolveCityCode: (name) => cityByName.get(name),
    now: new Date(),
  });

  return { fileSha256: sha256Of(JSON.stringify(file)), planResult };
};

export const plan = async (file: LessonImportFileInput): Promise<AgentImportPlanResponse> => {
  const { fileSha256, planResult } = await buildPlan(file, db);
  const digest = computeDigest(fileSha256, planResult);
  return {
    digest,
    counts: planResult.counts,
    additions: planResult.additions,
    updates: planResult.updates,
    deletions: planResult.deletions,
    questions: planResult.questions,
    newLinks: planResult.newLinks,
    withheldIfUnacked: planResult.withheldIfUnacked,
    skipped: planResult.skipped,
  };
};

export const listRabbisForAgent = async (query: AgentRabbiListQuery): Promise<AgentImportRabbiSearchResult> => {
  const condition = query.q ? ilike(rabbis.name, `%${escapeLikePattern(query.q)}%`) : undefined;
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(rabbis)
      .where(condition)
      .orderBy(rabbis.name)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(rabbis).where(condition),
  ]);
  const citiesByRabbi = await loadCitiesByRabbi(db, rows.map((row) => row.id));

  return {
    items: rows.map((row) => ({ ...toRabbiSummary(row), cities: citiesByRabbi.get(row.id) ?? [] })),
    page: query.page,
    pageSize: query.pageSize,
    total: totalRows[0]?.count ?? 0,
  };
};

const assertRuleDoesNotCoverBuiltIn = (kind: string, matchText: string): void => {
  const coversBuiltIn =
    (kind === 'city_alias' && Object.prototype.hasOwnProperty.call(BUILT_IN_CITY_ALIASES, matchText)) ||
    (kind === 'time_kind' && Object.prototype.hasOwnProperty.call(BUILT_IN_TIME_KIND_NOTES, matchText)) ||
    (kind === 'audience_alias' && Object.prototype.hasOwnProperty.call(BUILT_IN_AUDIENCE_ALIASES, matchText)) ||
    (kind === 'topic_alias' && Object.prototype.hasOwnProperty.call(BUILT_IN_TOPIC_ALIASES, matchText));
  if (coversBuiltIn) throw new RuleCoversBuiltInError(kind, matchText);
};

// One decision at a time: link a name to a rabbi, ignore it, create a new
// rabbi and link it in one transaction, or teach the planner a rule. Each
// is something the owner confirmed; the server never infers one on its own.
export const decide = async (request: AgentImportDecisionRequest): Promise<AgentImportDecisionResponse> => {
  if (request.kind === 'rule') {
    const valueSchema = ruleValueSchemaFor(request.ruleKind);
    const value = valueSchema.parse(request.value);
    // Cleaned the same way a row's own text is cleaned at read time, and
    // before the built-in check, so a rule can never be taught in a form
    // that would never actually match a row (e.g. "קריית עתא" instead of
    // the cleaned "קרית אתא").
    const matchText = request.ruleKind === 'city_alias' ? cleanCityText(request.matchText) : request.matchText;
    assertRuleDoesNotCoverBuiltIn(request.ruleKind, matchText);

    if (request.ruleKind === 'city_alias') {
      const cityCode = (value as { cityCode: number }).cityCode;
      const cityRows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
      if (!cityRows[0]) throw new UnknownCityCodeError(cityCode);
    }

    try {
      await db.insert(lessonImportRules).values({ kind: request.ruleKind, matchText, value, reason: request.reason });
    } catch (error) {
      if (isUniqueViolation(error)) throw new AlreadyDecidedError(`${request.ruleKind}:${matchText}`);
      throw error;
    }
    return {};
  }

  const nameKey = nameKeyOf(request.nameKey);

  if (request.kind === 'link') {
    const rabbiRows = await db.select({ id: rabbis.id, name: rabbis.name, honorific: rabbis.honorific }).from(rabbis).where(eq(rabbis.id, request.rabbiId)).limit(1);
    const rabbi = rabbiRows[0];
    if (!rabbi) throw new UnknownRabbiError(request.rabbiId);
    // The import only ever deals with rabbis: a name is never linked to a
    // rabbanit, not even by hand.
    if (rabbi.honorific === 'rabbanit') throw new LinkTargetIsRabbanitError(request.rabbiId);
    try {
      await db.insert(lessonImportRabbiLinks).values({ nameKey, source: request.source, rabbiId: rabbi.id, decision: 'linked', origin: 'owner' });
    } catch (error) {
      if (isUniqueViolation(error)) throw new AlreadyDecidedError(`${nameKey}|${request.source}`);
      throw error;
    }
    const newLink: AgentImportNewLink = {
      nameKey,
      source: request.source,
      rabbiId: rabbi.id,
      rabbiName: rabbi.name,
      rabbiHonorific: rabbi.honorific,
    };
    return { newLink };
  }

  if (request.kind === 'ignore') {
    try {
      await db
        .insert(lessonImportRabbiLinks)
        .values({ nameKey, source: request.source, rabbiId: null, decision: 'ignored', origin: 'owner', reason: request.reason });
    } catch (error) {
      if (isUniqueViolation(error)) throw new AlreadyDecidedError(`${nameKey}|${request.source}`);
      throw error;
    }
    return {};
  }

  // new_rabbi: always creates a rav (the import never creates a rabbanit;
  // there is no `honorific` on this request), no photo, and its link, in
  // one transaction, so a failure halfway never leaves an orphaned rabbi
  // or a dangling link.
  try {
    return await db.transaction(async (tx) => {
      const name = rabbiNameSchema.parse(request.name);
      const [rabbiRow] = await tx.insert(rabbis).values({ id: nanoid(), name, honorific: 'rav', title: request.title }).returning();
      if (!rabbiRow) throw new Error('insert into rabbis returned no row');
      await tx.insert(lessonImportRabbiLinks).values({ nameKey, source: request.source, rabbiId: rabbiRow.id, decision: 'linked', origin: 'owner' });
      const newLink: AgentImportNewLink = {
        nameKey,
        source: request.source,
        rabbiId: rabbiRow.id,
        rabbiName: rabbiRow.name,
        rabbiHonorific: rabbiRow.honorific,
      };
      return { newLink };
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AlreadyDecidedError(`${nameKey}|${request.source}`);
    throw error;
  }
};

const writeValuesFor = (write: ResolvedWrite) => {
  // `NormalizedRow.audience` is optional pre-resolution (an unstated row
  // audience is resolved only once the rabbi's honorific is known, in
  // `planCore`); every `ResolvedWrite` is built after that resolution, so
  // it is always definite by the time it reaches a write.
  if (!write.row.audience) throw new Error(`data inconsistency: resolved write for import key '${write.importKey}' carries no audience`);
  return {
    title: write.row.title ?? null,
    rabbiId: write.rabbiId,
    placeName: write.row.place,
    placeStreet: write.row.street,
    placeFloor: null,
    cityCode: write.row.cityCode,
    topic: write.row.topic ?? null,
    audience: write.row.audience,
    recurrenceKind: write.row.recurrence.kind,
    recurrenceWeekdays: write.row.recurrence.kind === 'weekly' ? [write.row.recurrence.weekday] : null,
    recurrenceDate: write.row.recurrence.kind === 'once' ? write.row.recurrence.date : null,
    startTime: write.row.startTime,
    durationMinutes: write.row.durationMinutes,
    notes: write.row.notes ?? null,
    provenance: 'imported' as const,
    importKey: write.importKey,
    importSources: write.row.sources,
    updatedAt: new Date(),
  };
};

// Applies a previously computed plan under an advisory lock: re-plans
// against the current database *inside this same transaction* (never the
// shared pool: a re-plan through the pool could miss a write another
// session commits between the read and this transaction's own writes,
// which is exactly the race the digest check exists to close), and only
// proceeds if the digest still matches (otherwise `PlanChangedError`,
// mapped to 409 `plan_changed`).
//
// The advisory lock only ever blocks a second `apply`; it does nothing
// against a concurrent admin or rabbi edit, which never takes it. What
// actually protects a lesson from those is real row locking: every write
// is guarded by `provenance = 'imported'` and checks the row it actually
// touched (an update's `.returning()`, a delete's `SELECT ... FOR UPDATE`
// below), so a lesson a concurrent hand edit protects between the plan and
// this transaction's own writes is reported (logged) and left alone,
// never overwritten or deleted regardless of what the plan decided a
// moment earlier.
export const apply = async (request: ApplyRequestInput, log: FastifyBaseLogger): Promise<AgentImportApplyResult> => {
  const acks = new Set(request.acks ?? []);

  return db.transaction(async (tx) => {
    const lockResult = await tx.execute(sql`select pg_try_advisory_xact_lock(${IMPORT_ADVISORY_LOCK_KEY}) as locked`);
    const locked = Boolean((lockResult as unknown as { locked: boolean }[])[0]?.locked);
    if (!locked) throw new ImportBusyError();

    const { fileSha256, planResult } = await buildPlan(request.file, tx);
    const digest = computeDigest(fileSha256, planResult);
    if (digest !== request.digest) throw new PlanChangedError();

    // Inserts batch into one query; Drizzle has no per-row-different bulk
    // update, so updates (usually the smaller half of a run) still run one
    // at a time, each guarded by `provenance = 'imported'`.
    const newRows = planResult.resolvedWrites.filter((write) => !write.existingLessonId);
    const updatedRows = planResult.resolvedWrites.filter((write) => write.existingLessonId);
    if (newRows.length) {
      await tx.insert(lessons).values(newRows.map((write) => ({ id: nanoid(), ...writeValuesFor(write) })));
    }
    let actuallyUpdatedCount = 0;
    for (const write of updatedRows) {
      const updated = await tx
        .update(lessons)
        .set(writeValuesFor(write))
        .where(and(eq(lessons.id, write.existingLessonId as string), eq(lessons.provenance, 'imported')))
        .returning({ id: lessons.id });
      if (updated[0]) actuallyUpdatedCount += 1;
      else log.warn({ lessonId: write.existingLessonId }, 'agent import: lesson no longer imported, update skipped mid-apply');
    }

    const ackedWithheld = planResult.withheldIfUnacked.filter((item) => item.causingSources.every((source) => acks.has(source)));
    const stillWithheld = planResult.withheldIfUnacked.filter((item) => !item.causingSources.every((source) => acks.has(source)));
    const deletionTargets = [...planResult.deletions, ...ackedWithheld];
    const deletionTargetIds = deletionTargets.map((item) => item.lessonId).filter((id): id is string => id !== undefined);

    // A lesson can stop qualifying for deletion between the plan (even
    // this transaction's own re-plan above) and this exact statement: a
    // concurrent admin or rabbi session can commit a hand edit in between,
    // since re-planning inside the transaction narrows that window but
    // does not close it. `SELECT ... FOR UPDATE` both re-checks
    // `provenance = 'imported'` at the last possible moment and takes a
    // real row lock on every id it returns, so a concurrent edit on one of
    // those rows blocks behind this transaction rather than racing past
    // it. Only the ids this query returns ever get their exceptions or
    // themselves deleted; a dropped-out id is logged, never deleted.
    let actuallyDeletedIds = new Set<string>();
    if (deletionTargetIds.length) {
      const lockedRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(inArray(lessons.id, deletionTargetIds), eq(lessons.provenance, 'imported')))
        .for('update');
      actuallyDeletedIds = new Set(lockedRows.map((row) => row.id));
      const idsToDelete = deletionTargetIds.filter((id) => actuallyDeletedIds.has(id));

      if (idsToDelete.length) {
        await tx.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, idsToDelete));
        await tx.delete(lessons).where(inArray(lessons.id, idsToDelete));
      }
      for (const id of deletionTargetIds) {
        if (!actuallyDeletedIds.has(id)) log.warn({ lessonId: id }, 'agent import: lesson no longer imported, deletion skipped mid-apply');
      }
    }
    const deletedSummaries = deletionTargets.filter((item) => item.lessonId && actuallyDeletedIds.has(item.lessonId));

    const distinctNewLinks = [...new Map(planResult.newLinks.map((link) => [`${link.nameKey}|${link.source}`, link] as const)).values()];
    if (distinctNewLinks.length) {
      await tx
        .insert(lessonImportRabbiLinks)
        .values(distinctNewLinks.map((link) => ({ nameKey: link.nameKey, source: link.source, rabbiId: link.rabbiId, decision: 'linked' as const, origin: 'auto' as const })))
        .onConflictDoNothing();
    }

    const counts = { ...planResult.counts, updated: actuallyUpdatedCount, deleted: deletedSummaries.length };

    await tx.insert(lessonImportRuns).values({
      week: request.file.week,
      fileSha256,
      counts,
      deleted: deletedSummaries,
      withheld: stillWithheld,
      newLinks: planResult.newLinks,
    });

    return { counts, newLinks: planResult.newLinks, withheld: stillWithheld, deleted: deletedSummaries };
  });
};
