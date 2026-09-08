import { z } from 'zod';

import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const adminUserIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

// `password`'s length is checked in the service against `MIN_PASSWORD_LENGTH`,
// not here, so a too-short password fails as the domain's `WeakPasswordError`
// rather than a generic Zod issue.
export const createAdminUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  password: z.string(),
});
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const updateAdminUserSchema = z.object({
  isActive: z.boolean(),
});
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive: boolean;
}

export interface AdminUserListResult {
  items: AdminUserRecord[];
  page: number;
  pageSize: number;
  total: number;
}
