import type { City } from '@torabarabim/common';

import type { SourceAdapter } from '../adapters/models';
import { todayInIsrael } from '../date-utils';
import type { Config } from '../config';
import { createFetcher } from '../fetch/fetcher';
import type { Fetcher } from '../fetch/models';
import { normalizeLesson } from '../normalize/normalize';
import { diffSnapshot } from '../snapshot/diff';
import { readSnapshot, writeSnapshot } from '../snapshot/store';
import type { RunReport, SourceRunResult } from './models';

const describeError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const emptyResult = (adapter: SourceAdapter, status: 'failed' | 'empty', error?: string): SourceRunResult => ({
  sourceId: adapter.id,
  sourceName: adapter.name,
  status,
  error,
  lessons: [],
  newLessonKeys: [],
  deletedLessonKeys: [],
  deletionsSkipped: true,
});

// Runs one adapter end to end: collect, normalize, diff against its
// snapshot, and persist the new snapshot. Never throws: any failure at any
// step becomes a 'failed' result, so one bad adapter cannot take down the
// others in runAll below.
export const runSource = async (adapter: SourceAdapter, fetcher: Fetcher, cities: City[], outputDir: string): Promise<SourceRunResult> => {
  let rawLessons;
  try {
    rawLessons = await adapter.collect(fetcher);
  } catch (error) {
    return emptyResult(adapter, 'failed', describeError(error));
  }

  if (rawLessons.length === 0) {
    return emptyResult(adapter, 'empty');
  }

  try {
    const today = todayInIsrael(new Date());
    const lessons = rawLessons.map((raw) => normalizeLesson(adapter.id, raw, cities, today));
    const previous = await readSnapshot(outputDir, adapter.id);
    const diff = diffSnapshot(previous, lessons, today);
    await writeSnapshot(outputDir, adapter.id, lessons);

    return {
      sourceId: adapter.id,
      sourceName: adapter.name,
      status: 'ok',
      lessons,
      newLessonKeys: diff.newLessons.map((lesson) => lesson.key),
      deletedLessonKeys: diff.deletedKeys,
      deletionsSkipped: false,
    };
  } catch (error) {
    return emptyResult(adapter, 'failed', describeError(error));
  }
};

export const runAll = async (adapters: SourceAdapter[], config: Config, cities: City[]): Promise<RunReport> => {
  const fetcher = createFetcher({
    userAgent: config.userAgent,
    requestDelayMs: config.requestDelayMs,
    requestTimeoutMs: config.requestTimeoutMs,
    retryCount: config.retryCount,
    retryBaseDelayMs: config.retryBaseDelayMs,
    cacheTtlMs: config.cacheTtlMs,
    cacheDir: config.cacheDir,
  });

  const results = await Promise.all(adapters.map((adapter) => runSource(adapter, fetcher, cities, config.outputDir)));

  return { runAt: new Date().toISOString(), results };
};
