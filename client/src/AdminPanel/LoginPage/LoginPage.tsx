import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { useAdminSession } from '~/AdminPanel/useAdminSession';

import * as consts from './consts';
import type { LoginFormState, LoginPageProps } from './models';
import * as styles from './styles';
import { useAdminLogin } from './useAdminLogin';

export const LoginPage = styled(({ className }: LoginPageProps) => {
  const session = useAdminSession();
  const location = useLocation();
  const login = useAdminLogin();
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });

  // Already signed in (e.g. followed a stale link to /admin/login): go
  // straight back to wherever the guard would have sent them.
  if (session.data) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? ADMIN_ROUTES.lessons} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login.mutate({ email: form.email, password: form.password });
  };

  const from = (location.state as { from?: string } | null)?.from;
  if (login.isSuccess) return <Navigate to={from ?? ADMIN_ROUTES.lessons} replace />;

  return (
    <div className={className}>
      <div className="brand">
        <span className="wordmark" dir="auto">
          {consts.WORDMARK}
        </span>
        <span className="badge">{consts.ADMIN_BADGE_LABEL}</span>
      </div>

      <div className="card">
        <h1 className="heading">{consts.HEADING}</h1>
        <p className="subtext">{consts.SUBTEXT}</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {login.isError && (
            <p className="error" role="alert">
              {adminErrorMessage(login.error, { 401: consts.INVALID_CREDENTIALS_MESSAGE })}
            </p>
          )}

          <label className="field">
            <span className="label">{consts.EMAIL_LABEL}</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              dir="auto"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className="field">
            <span className="label">{consts.PASSWORD_LABEL}</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button type="submit" className="submit" disabled={login.isPending}>
            {login.isPending ? consts.SUBMIT_PENDING_LABEL : consts.SUBMIT_LABEL}
          </button>
        </form>
      </div>

      <p className="forgot">{consts.FORGOT_PASSWORD_NOTE}</p>
    </div>
  );
})`
  ${styles.LoginPage}
`;
