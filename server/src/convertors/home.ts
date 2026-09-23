import type { DedicationGroup, HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';

import type { DedicationGroupResult } from '../service/dedication/models';
import type { HomeResult, HomeRowResult, ResolvedHomeOccurrence } from '../service/home/models';
import { toRabbiSummary } from '../service/shared/rabbi-summary';
import { toDedication } from './dedication';

const toLessonOccurrence = (record: ResolvedHomeOccurrence): LessonOccurrence => ({
  lessonId: record.lessonId,
  date: record.date,
  startTime: record.startTime,
  endTime: record.endTime,
  status: 'scheduled',
  title: record.title,
  topic: record.topic,
  audience: record.audience,
  rabbi: record.rabbi,
  venue: record.venue,
  substituteRabbi: record.substituteRabbi,
  note: record.note,
});

const toHomeRow = (row: HomeRowResult): HomeRow => ({
  id: row.id,
  title: row.title,
  items: row.items.map(toLessonOccurrence),
  womensAreaTileIndex: row.womensAreaTileIndex,
});

const toDedicationGroup = (group: DedicationGroupResult): DedicationGroup => ({
  type: group.type,
  items: group.items.map(toDedication),
});

export const toHomeResponse = (result: HomeResult): HomeResponse => ({
  rows: result.rows.map(toHomeRow),
  womensAreaLessonCount: result.womensAreaLessonCount,
  rabbis: result.rabbis.map(toRabbiSummary),
  dedications: result.dedicationGroups.map(toDedicationGroup),
});
