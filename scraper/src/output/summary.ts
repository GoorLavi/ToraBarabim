import type { RunReport } from '../run/models';

export const buildSummary = (report: RunReport): string => {
  const lines = [`Scraper run at ${report.runAt}`];

  for (const result of report.results) {
    if (result.status === 'failed') {
      lines.push(`  ${result.sourceName} (${result.sourceId}): FAILED, ${result.error}`);
      continue;
    }

    if (result.status === 'empty') {
      lines.push(`  ${result.sourceName} (${result.sourceId}): 0 lessons published, deletions skipped`);
      continue;
    }

    const gapsCount = result.lessons.filter((lesson) => lesson.gaps.length > 0).length;
    lines.push(
      `  ${result.sourceName} (${result.sourceId}): ${result.lessons.length} lessons` +
        ` (${gapsCount} with gaps), ${result.newLessonKeys.length} new, ${result.deletedLessonKeys.length} to delete`,
    );
  }

  if (report.results.length === 0) {
    lines.push('  No adapters registered, nothing to collect.');
  }

  return lines.join('\n');
};
