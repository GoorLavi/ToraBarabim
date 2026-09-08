import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { AdminApiError } from '~/AdminPanel/api';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import * as consts from './consts';
import { validateSetPasswordForm } from './helpers';
import type { AdminCardProps, SetPasswordFormErrors, SetPasswordFormState } from './models';
import * as styles from './styles';
import { useDeleteAdminUser } from './useDeleteAdminUser';
import { useSetAdminUserActive } from './useSetAdminUserActive';
import { useSetAdminUserPassword } from './useSetAdminUserPassword';

const emptyPasswordForm: SetPasswordFormState = { password: '', confirmPassword: '' };

export const AdminCard = styled(({ className, admin }: AdminCardProps) => {
  const setActive = useSetAdminUserActive(admin.id);
  const deleteAdmin = useDeleteAdminUser(admin.id);
  const setPassword = useSetAdminUserPassword(admin.id);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<SetPasswordFormState>(emptyPasswordForm);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<SetPasswordFormErrors>({});

  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const passwordFirstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDeleteDialogOpen) return;
    deleteDialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !deleteAdmin.isPending) setIsDeleteDialogOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isDeleteDialogOpen, deleteAdmin.isPending]);

  useEffect(() => {
    if (!isPasswordDialogOpen) return;
    passwordFirstInputRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !setPassword.isPending) setIsPasswordDialogOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isPasswordDialogOpen, setPassword.isPending]);

  const openPasswordDialog = (): void => {
    setPasswordForm(emptyPasswordForm);
    setPasswordFieldErrors({});
    setPassword.reset();
    setIsPasswordDialogOpen(true);
  };

  const confirmDelete = (): void => {
    deleteAdmin.mutate(undefined, { onSuccess: () => setIsDeleteDialogOpen(false) });
  };

  const submitSetPassword = (): void => {
    const errors = validateSetPasswordForm(passwordForm);
    setPasswordFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPassword.mutate(passwordForm.password, { onSuccess: () => setIsPasswordDialogOpen(false) });
  };

  const passwordServerError = setPassword.isError && setPassword.error instanceof AdminApiError ? setPassword.error : undefined;
  const passwordFieldError = passwordFieldErrors.password ?? (passwordServerError?.code === 'weak_password' ? consts.WEAK_PASSWORD_ERROR : undefined);
  const passwordGeneralError = passwordServerError && passwordServerError.code !== 'weak_password' ? adminErrorMessage(passwordServerError) : undefined;

  return (
    <article className={className}>
      <div className="body">
        <h3 className="name">
          <bdi dir="auto">{admin.name}</bdi>
        </h3>
        <p className="email">
          <bdi dir="auto">{admin.email}</bdi>
        </p>
        {admin.username && (
          <p className="username">
            <bdi dir="auto">{consts.usernameLabel(admin.username)}</bdi>
          </p>
        )}
        <span className={classNames('statusPill', { inactive: !admin.isActive })}>
          {admin.isActive ? consts.ACTIVE_LABEL : consts.INACTIVE_LABEL}
        </span>
      </div>

      <div className="actions">
        {admin.isSuper ? (
          <p className="note">{consts.CANNOT_MODIFY_SUPER_ADMIN_NOTE}</p>
        ) : (
          <button type="button" disabled={setActive.isPending} onClick={() => setActive.mutate(!admin.isActive)}>
            {setActive.isPending
              ? consts.UPDATING_STATUS_LABEL
              : admin.isActive
                ? consts.DEACTIVATE_LABEL
                : consts.ACTIVATE_LABEL}
          </button>
        )}

        {!admin.isSuper && !admin.isActive && (
          <button type="button" className="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            {consts.DELETE_LABEL}
          </button>
        )}

        <button type="button" onClick={openPasswordDialog}>
          {consts.SET_PASSWORD_LABEL}
        </button>

        {setActive.isError && (
          <p className="error">{adminErrorMessage(setActive.error, { cannot_modify_super_admin: consts.CANNOT_MODIFY_SUPER_ADMIN_ERROR })}</p>
        )}
      </div>

      {isDeleteDialogOpen && (
        <div className="overlay" role="presentation" onClick={() => !deleteAdmin.isPending && setIsDeleteDialogOpen(false)}>
          <div
            className="dialog"
            ref={deleteDialogRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="heading">{consts.DELETE_CONFIRM_HEADING}</p>
            <p className="message">
              {consts.DELETE_CONFIRM_MESSAGE_PREFIX}
              <bdi dir="auto">{admin.name}</bdi>
              {consts.DELETE_CONFIRM_MESSAGE_SUFFIX}
            </p>
            {deleteAdmin.isError && (
              <p className="error">
                {adminErrorMessage(deleteAdmin.error, {
                  admin_user_still_active: consts.ADMIN_STILL_ACTIVE_ERROR,
                  cannot_modify_super_admin: consts.CANNOT_MODIFY_SUPER_ADMIN_ERROR,
                })}
              </p>
            )}
            <div className="actions">
              <button type="button" className="cancel" disabled={deleteAdmin.isPending} onClick={() => setIsDeleteDialogOpen(false)}>
                {consts.DELETE_CONFIRM_CANCEL_LABEL}
              </button>
              <button type="button" className="confirm" disabled={deleteAdmin.isPending} onClick={confirmDelete}>
                {deleteAdmin.isPending ? consts.DELETING_LABEL : consts.DELETE_CONFIRM_CONFIRM_LABEL}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordDialogOpen && (
        <div className="overlay" role="presentation" onClick={() => !setPassword.isPending && setIsPasswordDialogOpen(false)}>
          <div className="dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <p className="heading">
              {consts.SET_PASSWORD_DIALOG_HEADING_PREFIX}
              <bdi dir="auto">{admin.name}</bdi>
            </p>

            {passwordGeneralError && <p className="error">{passwordGeneralError}</p>}

            <label className={classNames('field', { invalid: Boolean(passwordFieldError) })}>
              <span className="label">{consts.NEW_PASSWORD_LABEL}</span>
              <input
                ref={passwordFirstInputRef}
                type="password"
                autoComplete="new-password"
                value={passwordForm.password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              {passwordFieldError ? <span className="error">{passwordFieldError}</span> : <span className="helper">{consts.PASSWORD_HELPER}</span>}
            </label>

            <label className={classNames('field', { invalid: Boolean(passwordFieldErrors.confirmPassword) })}>
              <span className="label">{consts.CONFIRM_NEW_PASSWORD_LABEL}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
              {passwordFieldErrors.confirmPassword && <span className="error">{passwordFieldErrors.confirmPassword}</span>}
            </label>

            <div className="actions">
              <button type="button" className="cancel" disabled={setPassword.isPending} onClick={() => setIsPasswordDialogOpen(false)}>
                {consts.SET_PASSWORD_CANCEL_LABEL}
              </button>
              <button type="button" className="confirm" disabled={setPassword.isPending} onClick={submitSetPassword}>
                {setPassword.isPending ? consts.SET_PASSWORD_SUBMITTING_LABEL : consts.SET_PASSWORD_SUBMIT_LABEL}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
})`
  ${styles.AdminCard}
`;
