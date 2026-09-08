import { MIN_PASSWORD_LENGTH } from '~/AdminPanel/consts';

import * as consts from './consts';
import type { SetPasswordFormErrors, SetPasswordFormState } from './models';

export const validateSetPasswordForm = (form: SetPasswordFormState): SetPasswordFormErrors => {
  const errors: SetPasswordFormErrors = {};
  if (form.password.length < MIN_PASSWORD_LENGTH) errors.password = consts.PASSWORD_TOO_SHORT_ERROR;
  if (form.confirmPassword !== form.password) errors.confirmPassword = consts.PASSWORD_MISMATCH_ERROR;
  return errors;
};
