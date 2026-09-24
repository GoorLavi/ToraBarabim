import type { AdminDedication, AdminDedicationState, DedicationListResponse } from '@torabarabim/common';

import type { DedicationListResult, DedicationRecord } from '../service/admin-dedication/models';
import { todayInIsrael } from '../service/lesson/israel-time';
import { toDedicationText } from './dedication';

// Mirrors the comment on `AdminDedicationState` (`common/src/admin.ts`).
// Derived here, from the same `todayInIsrael` date `listActive`
// (`service/dedication/dedication.ts`) uses to decide whether to serve the
// row at all, and never stored: a taken-down record keeps its window dates
// exactly as they were, so this is the only place the four states exist.
const deriveState = (record: DedicationRecord, today: string): AdminDedicationState => {
  if (record.takenDownReason !== undefined) return 'takenDown';
  if (today < record.startsOn) return 'upcoming';
  if (today > record.endsOn) return 'ended';
  return 'live';
};

export const toAdminDedication = (record: DedicationRecord, now: Date): AdminDedication => ({
  id: record.id,
  type: record.type,
  honoredName: record.honoredName,
  honorific: record.honorific,
  honoredGender: record.honoredGender,
  parentName: record.parentName,
  donorFamilyName: record.donorFamilyName,
  closingLineEnabled: record.closingLineEnabled,
  startsOn: record.startsOn,
  endsOn: record.endsOn,
  takenDownReason: record.takenDownReason,
  state: deriveState(record, todayInIsrael(now)),
  display: toDedicationText(record),
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const toDedicationListResponse = (result: DedicationListResult, now: Date): DedicationListResponse => ({
  items: result.items.map((item) => toAdminDedication(item, now)),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
