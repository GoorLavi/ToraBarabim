import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RunReport } from '../run/models';
import { buildSummary } from './summary';

export const writeRunReport = async (outputDir: string, report: RunReport): Promise<string> => {
  await mkdir(outputDir, { recursive: true });
  const fileName = `run-${report.runAt.replace(/[:.]/g, '-')}.json`;
  const filePath = join(outputDir, fileName);
  await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');

  const summaryPath = join(outputDir, 'latest-summary.txt');
  await writeFile(summaryPath, buildSummary(report), 'utf-8');

  return filePath;
};
