import type { AdminUserListItem } from '@torabarabim/common';

export interface AdminCardProps {
  className?: string;
  admin: AdminUserListItem;
}

export interface SetPasswordFormState {
  password: string;
  confirmPassword: string;
}

export type SetPasswordFormField = 'password' | 'confirmPassword';
export type SetPasswordFormErrors = Partial<Record<SetPasswordFormField, string>>;
