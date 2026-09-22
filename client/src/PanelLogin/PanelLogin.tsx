import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import * as consts from './consts';
import { panelErrorMessage } from './helpers';
import type { PanelLoginFormState, PanelLoginProps } from './models';
import * as styles from './styles';
import { usePanelLogin } from './usePanelLogin';

// The one shared login door for a rabbi or a place account. No role badge
// under the wordmark: nobody's role is known until the server answers, so
// any badge shown before that would be wrong for half the people arriving.
// The destination after a successful login (`landingPath`) is likewise the
// server's call, never computed here.
export const PanelLogin = styled(({ className }: PanelLoginProps) => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? undefined;
  const login = usePanelLogin();
  const [form, setForm] = useState<PanelLoginFormState>({ identifier: '', password: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login.mutate({ identifier: form.identifier, password: form.password, from });
  };

  if (login.isSuccess) return <Navigate to={login.data.landingPath} replace />;

  return (
    <div className={className}>
      <div className="content">
        <div className="brand">
          <span className="wordmark" dir="auto">
            {consts.WORDMARK}
          </span>
        </div>

        <div className="card">
          <h1 className="heading">{consts.HEADING}</h1>
          <p className="subtext">{consts.SUBTEXT}</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            {login.isError && (
              <p className="error" role="alert">
                {panelErrorMessage(login.error)}
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
  ${styles.PanelLogin}
`;
