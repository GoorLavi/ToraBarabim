import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import { useUpdateVisitorMessage } from '../../../../useUpdateVisitorMessage';
import * as consts from './consts';
import { noteSaveFailureMessage } from './helpers';
import type { HandlingNoteProps } from './models';
import * as styles from './styles';

// How a message was handled, in the super admin's own words. Saving an empty
// note clears it, which the server answers with `null`, so the card then
// shows the empty state again.
export const HandlingNote = styled(({ className, messageId, note }: HandlingNoteProps) => {
  const save = useUpdateVisitorMessage(messageId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hasEditedRef = useRef(false);

  // After saving or cancelling, the editor unmounts and focus would fall to
  // the page: it returns to the button that opened it.
  useEffect(() => {
    if (!isEditing && hasEditedRef.current) triggerRef.current?.focus();
  }, [isEditing]);

  const startEditing = (): void => {
    hasEditedRef.current = true;
    save.reset();
    setDraft(note ?? '');
    setIsEditing(true);
  };

  const cancelEditing = (): void => {
    save.reset();
    setIsEditing(false);
  };

  const saveNote = (): void => {
    save.mutate({ handlingNote: draft }, { onSuccess: () => setIsEditing(false) });
  };

  if (isEditing) {
    return (
      <div className={className}>
        <label className="label" htmlFor={`note-${messageId}`}>
          {consts.NOTE_LABEL}
        </label>
        <textarea
          id={`note-${messageId}`}
          className="field"
          rows={consts.NOTE_ROWS}
          maxLength={consts.NOTE_MAX_LENGTH}
          dir={directionForValue(draft)}
          readOnly={save.isPending}
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        {save.isError && (
          <p className="failure" role="alert">
            {noteSaveFailureMessage(save.error)}
          </p>
        )}

        <div className="actions">
          <button type="button" className="save" disabled={save.isPending} aria-busy={save.isPending} onClick={saveNote}>
            {save.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <button type="button" className="cancel" disabled={save.isPending} onClick={cancelEditing}>
            {consts.CANCEL_LABEL}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {note !== null && (
        <>
          <span className="label">{consts.NOTE_LABEL}</span>
          <p className="text" dir="auto">
            {note}
          </p>
        </>
      )}
      <button type="button" className="trigger" ref={triggerRef} onClick={startEditing}>
        {note === null ? consts.ADD_NOTE_LABEL : consts.EDIT_NOTE_LABEL}
      </button>
    </div>
  );
})`
  ${styles.HandlingNote}
`;
