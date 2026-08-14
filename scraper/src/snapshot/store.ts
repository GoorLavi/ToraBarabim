import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { CollectedLesson } from '../normalize/models';
import type { SourceSnapshot } from './models';

const snapshotDir = (outputDir: string): string => join(outputDir, 'snapshots');
const snapshotFile = (outputDir: string, sourceId: string): string => join(snapshotDir(outputDir), `${sourceId}.json`);

export const readSnapshot = async (outputDir: string, sourceId: string): Promise<CollectedLesson[]> => {
  try {
    const raw = await readFile(snapshotFile(outputDir, sourceId), 'utf-8');
    return (JSON.parse(raw) as SourceSnapshot).lessons;
  } catch {
    return [];
  }
};

export const writeSnapshot = async (outputDir: string, sourceId: string, lessons: CollectedLesson[]): Promise<void> => {
  await mkdir(snapshotDir(outputDir), { recursive: true });
  const snapshot: SourceSnapshot = { sourceId, writtenAt: new Date().toISOString(), lessons };
  await writeFile(snapshotFile(outputDir, sourceId), JSON.stringify(snapshot, null, 2), 'utf-8');
};
