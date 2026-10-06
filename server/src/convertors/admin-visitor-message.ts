import type { AdminVisitorMessage, VisitorMessageListResponse } from '@torabarabim/common';

import type { VisitorMessageListResult, VisitorMessageRecord } from '../service/visitor-message/models';
import { subjectOfReport } from '../service/visitor-message/subject';

// `status` is derived from `handledAt` and never stored.
export const toAdminVisitorMessage = (record: VisitorMessageRecord): AdminVisitorMessage => {
  const base = {
    id: record.id,
    name: record.name,
    phone: record.phone,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
    handlingNote: record.handlingNote,
  };
  const content =
    record.type === 'report-mistake'
      ? { ...base, type: record.type, subject: subjectOfReport(record) }
      : { ...base, type: record.type };
  return record.handledAt
    ? { ...content, status: 'handled', handledAt: record.handledAt.toISOString() }
    : { ...content, status: 'unhandled' };
};

export const toVisitorMessageListResponse = (result: VisitorMessageListResult): VisitorMessageListResponse => ({
  items: result.items.map(toAdminVisitorMessage),
  pageSize: result.pageSize,
  nextCursor: result.nextCursor,
  unfilteredTotal: result.unfilteredTotal,
});
