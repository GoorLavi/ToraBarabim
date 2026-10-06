import type { VisitorMessageSubject } from '@torabarabim/common';

import type { VisitorMessageRecord } from './models';

// The subject of a stored report, rebuilt from its three columns. The table's
// CHECKs make every branch below unreachable for a row that was inserted; a
// throw here means a row the schema should have refused, and names it.
export const subjectOfReport = (record: Pick<VisitorMessageRecord, 'id' | 'subjectKind' | 'subjectId' | 'subjectDate'>): VisitorMessageSubject => {
  if (record.subjectId === null) {
    throw new Error(`expected a subject id on report ${record.id}, found none`);
  }
  if (record.subjectKind === 'place') {
    return { kind: 'place', placeId: record.subjectId };
  }
  if (record.subjectKind !== 'lesson') {
    throw new Error(`expected subject kind 'lesson' or 'place' on report ${record.id}, got '${record.subjectKind}'`);
  }
  if (record.subjectDate === null) {
    throw new Error(`expected a subject date on lesson report ${record.id}, found none`);
  }
  return { kind: 'lesson', lessonId: record.subjectId, date: record.subjectDate };
};
