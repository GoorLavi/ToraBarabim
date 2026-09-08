import * as consts from './consts';
import type { AdminUserFormErrors, AdminUserFormState } from './models';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAdminUserForm = (form: AdminUserFormState): AdminUserFormErrors => {
  const errors: AdminUserFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  if (!form.email.trim()) errors.email = consts.REQUIRED_EMAIL_ERROR;
  else if (!EMAIL_FORMAT.test(form.email.trim())) errors.email = consts.INVALID_EMAIL_ERROR;
  if (!form.username.trim()) errors.username = consts.REQUIRED_USERNAME_ERROR;
  if (form.password.length < consts.MIN_PASSWORD_LENGTH) errors.password = consts.PASSWORD_TOO_SHORT_ERROR;
  if (form.confirmPassword !== form.password) errors.confirmPassword = consts.PASSWORD_MISMATCH_ERROR;
  return errors;
};
