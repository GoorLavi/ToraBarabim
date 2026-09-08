import type { AdminUserListItem, AdminUserListResponse } from '@torabarabim/common';

import type { AdminUserListResult, AdminUserRecord } from '../service/admin-user/models';

export const toAdminUserListItem = (record: AdminUserRecord): AdminUserListItem => ({
  id: record.id,
  name: record.name,
  email: record.email,
  username: record.username,
  isActive: record.isActive,
  isSuper: record.isSuper,
});

export const toAdminUserListResponse = (result: AdminUserListResult): AdminUserListResponse => ({
  items: result.items.map(toAdminUserListItem),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
