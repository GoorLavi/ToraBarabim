import { useState } from 'react';
import type { FormEvent } from 'react';
import classNames from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage, suggestUsername } from '~/AdminPanel/helpers';
import { directionForValue } from '~/helpers';

import * as consts from './consts';
import { validateAdminUserForm } from './helpers';
import type { AdminFormPageProps, AdminUserFormErrors, AdminUserFormState } from './models';
import * as styles from './styles';
import { useCreateAdminUser } from './useCreateAdminUser';

const emptyForm: AdminUserFormState = { name: '', email: '', username: '', password: '', confirmPassword: '' };

export const AdminFormPage = styled(({ className }: AdminFormPageProps) => {
  const navigate = useNavigate();
  const createAdminUserMutation = useCreateAdminUser();

  const [form, setForm] = useState<AdminUserFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<AdminUserFormErrors>({});
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const errors = validateAdminUserForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    createAdminUserMutation.mutate(
      { name: form.name.trim(), email: form.email.trim(), username: form.username.trim(), password: form.password },
      { onSuccess: () => navigate(ADMIN_ROUTES.admins) },
    );
  };

  const serverError = createAdminUserMutation.isError && createAdminUserMutation.error instanceof AdminApiError ? createAdminUserMutation.error : undefined;

  const emailError = fieldErrors.email ?? (serverError?.code === 'duplicate_email' ? consts.DUPLICATE_EMAIL_ERROR : undefined);
  const usernameError = fieldErrors.username ?? (serverError?.code === 'duplicate_username' ? consts.DUPLICATE_USERNAME_ERROR : undefined);
  const passwordError = fieldErrors.password ?? (serverError?.code === 'weak_password' ? consts.WEAK_PASSWORD_ERROR : undefined);
  const isFieldError = serverError && ['duplicate_email', 'duplicate_username', 'weak_password'].includes(serverError.code ?? '');
  const generalError = serverError && !isFieldError ? adminErrorMessage(serverError) : undefined;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.admins}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <h1 className="heading">{consts.HEADING}</h1>

        {generalError && (
          <p className="error" role="alert">
            {generalError}
          </p>
        )}

        <label className={classNames('field', { invalid: Boolean(fieldErrors.name) })}>
          <span className="label">{consts.NAME_LABEL}</span>
          <input
            type="text"
            dir={directionForValue(form.name)}
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((prev) => ({ ...prev, name, username: isUsernameEdited ? prev.username : suggestUsername(name) }));
            }}
          />
          {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
        </label>

        <label className={classNames('field', { invalid: Boolean(emailError) })}>
          <span className="label">{consts.EMAIL_LABEL}</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="auto"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {emailError && <span className="error">{emailError}</span>}
        </label>

        <label className={classNames('field', { invalid: Boolean(usernameError) })}>
          <span className="label">{consts.USERNAME_LABEL}</span>
          <input
            type="text"
            dir="auto"
            value={form.username}
            onChange={(event) => {
              setIsUsernameEdited(true);
              setForm((prev) => ({ ...prev, username: event.target.value }));
            }}
          />
          {usernameError ? <span className="error">{usernameError}</span> : <span className="helper">{consts.USERNAME_HELPER}</span>}
        </label>

        <label className={classNames('field', { invalid: Boolean(passwordError) })}>
          <span className="label">{consts.PASSWORD_LABEL}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          {passwordError ? <span className="error">{passwordError}</span> : <span className="helper">{consts.PASSWORD_HELPER}</span>}
        </label>

        <label className={classNames('field', { invalid: Boolean(fieldErrors.confirmPassword) })}>
          <span className="label">{consts.CONFIRM_PASSWORD_LABEL}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
          />
          {fieldErrors.confirmPassword && <span className="error">{fieldErrors.confirmPassword}</span>}
        </label>

        <div className="footer">
          <Link className="cancel" to={ADMIN_ROUTES.admins}>
            {consts.CANCEL_LABEL}
          </Link>
          <button type="submit" className="submit" disabled={createAdminUserMutation.isPending}>
            {createAdminUserMutation.isPending ? consts.SUBMITTING_LABEL : consts.SUBMIT_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
})`
  ${styles.AdminFormPage}
`;
