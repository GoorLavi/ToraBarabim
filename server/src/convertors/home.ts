import type { HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';

import type { HomeResult, HomeRowResult, ResolvedHomeOccurrence } from '../service/home/models';

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
  place: record.place,
  substituteRabbi: record.substituteRabbi,
  note: record.note,
});

const toHomeRow = (row: HomeRowResult): HomeRow => ({
  id: row.id,
  title: row.title,
  items: row.items.map(toLessonOccurrence),
});

export const toHomeResponse = (result: HomeResult): HomeResponse => ({
  rows: result.rows.map(toHomeRow),
});
