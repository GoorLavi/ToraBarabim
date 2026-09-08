import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { AdminApiError } from '~/AdminPanel/api';
import { adminErrorMessage, suggestUsername } from '~/AdminPanel/helpers';

import * as consts from './consts';
import type { RabbiAccountSectionProps, RevealedPassword } from './models';
import * as styles from './styles';
import { useCreateRabbiAccount } from './useCreateRabbiAccount';
import { useRabbiAccount } from './useRabbiAccount';
import { useResetRabbiPassword } from './useResetRabbiPassword';
import { useSetRabbiAccountActive } from './useSetRabbiAccountActive';

// The temporary password is the one thing on this screen that cannot be
// recovered if lost: it is read aloud to the rabbi over the phone right
// after it is generated, and the server never returns it again. It lives
// only in `revealed`, local component state, never in the query cache,
// never in the URL, and it is dropped as soon as the admin confirms it was
// delivered (see the report for this slice).
export const RabbiAccountSection = styled(({ className, rabbiId, rabbiName }: RabbiAccountSectionProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [revealed, setRevealed] = useState<RevealedPassword | undefined>();
  const [isCopied, setIsCopied] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Keeps the username suggestion following the rabbi's name for as long as
  // the admin has not typed into the username field themselves: the name
  // field lives on the parent page and can still change while this section
  // is visible, before the account is ever created.
  useEffect(() => {
    if (isUsernameEdited) return;
    setUsername(suggestUsername(rabbiName));
  }, [rabbiName, isUsernameEdited]);

  const account = useRabbiAccount(rabbiId);
  const createAccount = useCreateRabbiAccount(rabbiId ?? '');
  const setActive = useSetRabbiAccountActive(rabbiId ?? '');
  const resetPassword = useResetRabbiPassword(rabbiId ?? '');

  if (!rabbiId) {
    return (
      <div className={className}>
        <h2 className="heading">{consts.SECTION_HEADING}</h2>
        <p className="note">{consts.BEFORE_FIRST_SAVE_NOTE}</p>
      </div>
    );
  }

  const submitCreate = (): void => {
    const hasEmail = Boolean(email.trim());
    const hasUsername = Boolean(username.trim());
    setEmailError(hasEmail ? undefined : consts.REQUIRED_EMAIL_ERROR);
    setUsernameError(hasUsername ? undefined : consts.REQUIRED_USERNAME_ERROR);
    if (!hasEmail || !hasUsername) return;

    createAccount.mutate(
      { email: email.trim(), username: username.trim() },
      {
        onSuccess: (created) => {
          setRevealed({ email: created.email, temporaryPassword: created.temporaryPassword });
          setEmail('');
          setUsername('');
          setIsUsernameEdited(false);
        },
      },
    );
  };

  const rabbiAccount = account.data;

  const confirmResetPassword = (): void => {
    resetPassword.mutate(undefined, {
      onSuccess: (result) => {
        if (rabbiAccount) setRevealed({ email: rabbiAccount.email, temporaryPassword: result.temporaryPassword });
        setIsResetDialogOpen(false);
      },
    });
  };

  const copyPassword = async (): Promise<void> => {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed.temporaryPassword);
    setIsCopied(true);
  };

  const dismissRevealed = (): void => {
    setRevealed(undefined);
    setIsCopied(false);
    createAccount.reset();
    resetPassword.reset();
  };

  return (
    <div className={className}>
      <h2 className="heading">{consts.SECTION_HEADING}</h2>

      {revealed && (
        <div className="revealCard" role="alert">
          <p className="heading">{consts.TEMPORARY_PASSWORD_HEADING}</p>
          <p className="note">{consts.TEMPORARY_PASSWORD_NOTE}</p>
          <div className="passwordRow">
            <span className="password" dir="ltr">
              {revealed.temporaryPassword}
            </span>
            <button type="button" className="copy" onClick={() => void copyPassword()}>
              {isCopied ? consts.COPIED_PASSWORD_LABEL : consts.COPY_PASSWORD_LABEL}
            </button>
          </div>
          <button type="button" className="dismiss" onClick={dismissRevealed}>
            {consts.DISMISS_PASSWORD_LABEL}
          </button>
        </div>
      )}

      {account.isPending && <p className="state" aria-live="polite">{consts.LOADING_MESSAGE}</p>}

      {account.isError && account.error.code !== 'account_not_found' && (
        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(account.error)}</p>
          <button type="button" className="retry" onClick={() => account.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {account.isError && account.error.code === 'account_not_found' && (
        <div className="createForm">
          <p className="note">{consts.NO_ACCOUNT_NOTE}</p>
          <label className="field">
            <span className="label">{consts.EMAIL_LABEL}</span>
            <input
              type="email"
              dir="auto"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              // This input lives inside `RabbiFormPage`'s own outer `<form>`
              // (nested `<form>` elements are invalid HTML), so Enter would
              // otherwise submit the rabbi's name and photo instead of
              // creating the account.
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                submitCreate();
              }}
            />
            {emailError && <span className="error">{emailError}</span>}
            {createAccount.isError && createAccount.error instanceof AdminApiError && createAccount.error.code !== 'duplicate_username' && (
              <span className="error">{adminErrorMessage(createAccount.error)}</span>
            )}
          </label>

          <label className="field">
            <span className="label">{consts.USERNAME_LABEL}</span>
            <input
              type="text"
              dir="auto"
              value={username}
              onChange={(event) => {
                setIsUsernameEdited(true);
                setUsername(event.target.value);
              }}
              // Same reasoning as the email field above: this input lives
              // inside `RabbiFormPage`'s own outer `<form>`.
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                submitCreate();
              }}
            />
            {usernameError ? <span className="error">{usernameError}</span> : <span className="helper">{consts.USERNAME_HELPER}</span>}
            {createAccount.isError && createAccount.error instanceof AdminApiError && createAccount.error.code === 'duplicate_username' && (
              <span className="error">{adminErrorMessage(createAccount.error)}</span>
            )}
          </label>

          <button type="button" className="submit" disabled={createAccount.isPending} onClick={submitCreate}>
            {createAccount.isPending ? consts.CREATING_ACCOUNT_LABEL : consts.CREATE_ACCOUNT_LABEL}
          </button>
        </div>
      )}

      {rabbiAccount && (
        <div className="accountDetails">
          <div className="row">
            <span className="label">{consts.ACCOUNT_EMAIL_LABEL}</span>
            <span className="value" dir="auto">
              {rabbiAccount.email}
            </span>
          </div>
          {rabbiAccount.username && (
            <div className="row">
              <span className="label">{consts.ACCOUNT_USERNAME_LABEL}</span>
              <span className="value" dir="auto">
                {rabbiAccount.username}
              </span>
            </div>
          )}
          <div className="row">
            <span className="label">{consts.ACCOUNT_STATUS_LABEL}</span>
            <span className={classNames('statusPill', { inactive: !rabbiAccount.isActive })}>
              {rabbiAccount.isActive ? consts.ACCOUNT_ACTIVE_LABEL : consts.ACCOUNT_INACTIVE_LABEL}
            </span>
          </div>

          {setActive.isError && <p className="note error">{adminErrorMessage(setActive.error)}</p>}

          <div className="actions">
            <button type="button" disabled={setActive.isPending} onClick={() => setActive.mutate(!rabbiAccount.isActive)}>
              {setActive.isPending
                ? consts.UPDATING_STATUS_LABEL
                : rabbiAccount.isActive
                  ? consts.DEACTIVATE_LABEL
                  : consts.ACTIVATE_LABEL}
            </button>
            <button type="button" disabled={resetPassword.isPending} onClick={() => setIsResetDialogOpen(true)}>
              {resetPassword.isPending ? consts.RESETTING_PASSWORD_LABEL : consts.RESET_PASSWORD_LABEL}
            </button>
          </div>

          {resetPassword.isError && <p className="note error">{adminErrorMessage(resetPassword.error)}</p>}
        </div>
      )}

      {isResetDialogOpen && (
        <div className="overlay" role="presentation" onClick={() => !resetPassword.isPending && setIsResetDialogOpen(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <p className="message">{consts.RESET_PASSWORD_CONFIRM_MESSAGE}</p>
            <div className="actions">
              <button type="button" className="cancel" disabled={resetPassword.isPending} onClick={() => setIsResetDialogOpen(false)}>
                {consts.RESET_PASSWORD_CONFIRM_CANCEL_LABEL}
              </button>
              <button type="button" className="confirm" disabled={resetPassword.isPending} onClick={confirmResetPassword}>
                {consts.RESET_PASSWORD_CONFIRM_CONFIRM_LABEL}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})`
  ${styles.RabbiAccountSection}
`;
