import type { AdminVisitorMessage, VisitorMessageListResponse } from '@torabarabim/common';

import type { VisitorMessageListResult, VisitorMessageRecord } from '../service/visitor-message/models';

// `status` is derived from `handledAt` and never stored.
export const toAdminVisitorMessage = (record: VisitorMessageRecord): AdminVisitorMessage => {
  const base = {
    id: record.id,
    type: record.type,
    name: record.name,
    phone: record.phone,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
    handlingNote: record.handlingNote,
  };
  return record.handledAt
    ? { ...base, status: 'handled', handledAt: record.handledAt.toISOString() }
    : { ...base, status: 'unhandled' };
};

export const toVisitorMessageListResponse = (result: VisitorMessageListResult): VisitorMessageListResponse => ({
  items: result.items.map(toAdminVisitorMessage),
  pageSize: result.pageSize,
  nextCursor: result.nextCursor,
  unfilteredTotal: result.unfilteredTotal,
});
