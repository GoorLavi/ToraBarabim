import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { useRabbiSession } from '~/RabbiPanel/useRabbiSession';

import * as consts from './consts';
import type { LoginFormState, LoginPageProps } from './models';
import * as styles from './styles';
import { useRabbiLogin } from './useRabbiLogin';

export const LoginPage = styled(({ className }: LoginPageProps) => {
  const session = useRabbiSession();
  const location = useLocation();
  const login = useRabbiLogin();
  const [form, setForm] = useState<LoginFormState>({ identifier: '', password: '' });

  // Already signed in (e.g. followed a stale link to /rabbi/login): go
  // straight back to wherever the guard would have sent them.
  if (session.data) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? RABBI_ROUTES.upcoming} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login.mutate({ identifier: form.identifier, password: form.password });
  };

  const from = (location.state as { from?: string } | null)?.from;
  if (login.isSuccess) return <Navigate to={from ?? RABBI_ROUTES.upcoming} replace />;

  return (
    <div className={className}>
      <div className="content">
        <div className="brand">
          <span className="wordmark" dir="auto">
            {consts.WORDMARK}
          </span>
          <span className="badge">{consts.BADGE_LABEL}</span>
        </div>

        <div className="card">
          <h1 className="heading">{consts.HEADING}</h1>
          <p className="subtext">{consts.SUBTEXT}</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            {login.isError && (
              <p className="error" role="alert">
                {rabbiErrorMessage(login.error, { 401: consts.INVALID_CREDENTIALS_ERROR, 429: consts.RATE_LIMITED_ERROR })}
              </p>
            )}

            <label className="field">
              <span className="label">{consts.IDENTIFIER_LABEL}</span>
              <input
                type="text"
                autoComplete="username"
                required
                dir="auto"
                value={form.identifier}
                onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
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

      <a
        className="whatsapp"
        href={consts.WHATSAPP_SUPPORT_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={consts.WHATSAPP_SUPPORT_TOOLTIP}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={consts.WHATSAPP_ICON_PATH} />
        </svg>
        <span className="tooltip" aria-hidden="true">
          {consts.WHATSAPP_SUPPORT_TOOLTIP}
        </span>
      </a>
    </div>
  );
})`
  ${styles.LoginPage}
`;
