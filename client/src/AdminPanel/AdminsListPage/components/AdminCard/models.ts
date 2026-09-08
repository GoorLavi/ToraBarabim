import type { AdminUserListItem } from '@torabarabim/common';

export interface AdminCardProps {
  className?: string;
  admin: AdminUserListItem;
  // True for the row of the admin currently signed in: the deactivate
  // action is hidden for that row (client/CLAUDE.md defense in depth, the
  // server also rejects this as `cannot_deactivate_self`).
  isSelf: boolean;
}
