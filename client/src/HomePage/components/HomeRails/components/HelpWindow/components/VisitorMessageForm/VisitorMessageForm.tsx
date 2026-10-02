import classNames from 'classnames';
import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import * as consts from './consts';
import { validateDraft } from './helpers';
import type { VisitorMessageField, VisitorMessageFormProps } from './models';
import * as styles from './styles';

// Checked on submit, then a flagged field is re-checked as it is edited. A
// field a visitor has not yet been told about is never flagged on blur.
export const VisitorMessageForm = styled(({ className, draft, status, messagePlaceholder, onDraftChange, onSubmit }: VisitorMessageFormProps) => {
  const idPrefix = useId();
  const [flaggedFields, setFlaggedFields] = useState<ReadonlySet<VisitorMessageField>>(new Set());
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const isSending = status === 'sending';
  const errors = validateDraft(draft);
  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([field]) => flaggedFields.has(field as VisitorMessageField)));

  const controlProps = (field: VisitorMessageField) => ({
    id: `${idPrefix}-${field}`,
    className: classNames('control', field),
    'aria-invalid': visibleErrors[field] !== undefined,
    'aria-describedby': visibleErrors[field] ? `${idPrefix}-${field}-error` : undefined,
    readOnly: isSending,
  });

  const focusField = (field: VisitorMessageField): void => {
    const refs = { name: nameRef, phone: phoneRef, message: messageRef };
    refs[field].current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isSending) return;

    const invalidFields = consts.FIELD_ORDER.filter((field) => errors[field] !== undefined);
    const firstInvalidField = invalidFields[0];
    if (firstInvalidField) {
      setFlaggedFields(new Set(invalidFields));
      focusField(firstInvalidField);
      return;
    }

    onSubmit();
  };

  const renderError = (field: VisitorMessageField) =>
    visibleErrors[field] && (
      <p className="error" id={`${idPrefix}-${field}-error`}>
        {visibleErrors[field]}
      </p>
    );

  return (
    <form className={className} onSubmit={handleSubmit} noValidate aria-busy={isSending}>
      <div className="field">
        <label className="label" htmlFor={`${idPrefix}-name`}>
          {consts.FIELD_LABELS.name}
        </label>
        <input
          {...controlProps('name')}
          ref={nameRef}
          type="text"
          autoComplete="name"
          maxLength={consts.NAME_MAX_LENGTH}
          dir={directionForValue(draft.name)}
          value={draft.name}
          onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
        />
        {renderError('name')}
      </div>

      <div className="field">
        <label className="label" htmlFor={`${idPrefix}-phone`}>
          {consts.FIELD_LABELS.phone}
        </label>
        <input
          {...controlProps('phone')}
          ref={phoneRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          dir="ltr"
          value={draft.phone}
          onChange={(event) => onDraftChange({ ...draft, phone: event.target.value })}
        />
        {renderError('phone')}
      </div>

      <div className="field">
        <label className="label" htmlFor={`${idPrefix}-message`}>
          {consts.FIELD_LABELS.message}
        </label>
        <textarea
          {...controlProps('message')}
          ref={messageRef}
          rows={consts.MESSAGE_FIELD_ROWS}
          maxLength={consts.MESSAGE_MAX_LENGTH}
          placeholder={messagePlaceholder}
          dir={directionForValue(draft.message)}
          value={draft.message}
          onChange={(event) => onDraftChange({ ...draft, message: event.target.value })}
        />
        {renderError('message')}
      </div>

      {status === 'failed' && (
        <p className="failure" role="alert">
          {consts.SEND_FAILURE_MESSAGE}
        </p>
      )}

      <button type="submit" className="submit" aria-disabled={isSending}>
        {isSending ? consts.SUBMIT_SENDING_LABEL : consts.SUBMIT_LABEL}
      </button>
    </form>
  );
})`
  ${styles.VisitorMessageForm}
`;
