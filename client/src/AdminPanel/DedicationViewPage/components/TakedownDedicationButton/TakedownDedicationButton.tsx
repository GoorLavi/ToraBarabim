import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import { takedownAdminDedication } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import * as consts from './consts';
import type { TakedownDedicationButtonProps } from './models';
import * as styles from './styles';

// Takedown is irreversible from a reader's point of view (root CLAUDE.md,
// Escalate Before Bending a Rule: this is exactly the kind of destructive
// action that needs a confirmation), and the server itself rejects a
// takedown with no `reason` (400), so the reason is required here too
// rather than letting that round trip be the only guard.
export const TakedownDedicationButton = styled(({ className, dedicationId }: TakedownDedicationButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const takedown = useMutation({
    mutationFn: () => takedownAdminDedication(dedicationId, { reason: reason.trim() }),
    onSuccess: (dedication) => {
      queryClient.setQueryData(ADMIN_QUERY_KEYS.dedication(dedicationId), dedication);
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dedicationsAll() });
      setIsDialogOpen(false);
    },
  });

  const confirm = (): void => {
    if (!reason.trim()) {
      setReasonError(consts.TAKEDOWN_REASON_REQUIRED_ERROR);
      return;
    }
    setReasonError(undefined);
    takedown.mutate();
  };

  return (
    <div className={className}>
      <button type="button" className="takedownTrigger" onClick={() => setIsDialogOpen(true)}>
        {consts.TAKEDOWN_LABEL}
      </button>

      {isDialogOpen && (
        <div className="overlay" role="presentation" onClick={() => !takedown.isPending && setIsDialogOpen(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2 className="heading">{consts.TAKEDOWN_CONFIRM_HEADING}</h2>
            <p className="irreversible">{consts.TAKEDOWN_IRREVERSIBLE_NOTE}</p>

            <label className="field">
              <span className="label">{consts.TAKEDOWN_REASON_LABEL}</span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
              <span className="helper">{consts.TAKEDOWN_REASON_HELPER}</span>
              {reasonError && <span className="error">{reasonError}</span>}
            </label>

            {takedown.isError && <p className="message error">{adminErrorMessage(takedown.error)}</p>}

            <div className="actions">
              <button type="button" className="cancel" disabled={takedown.isPending} onClick={() => setIsDialogOpen(false)}>
                {consts.TAKEDOWN_CANCEL_LABEL}
              </button>
              <button type="button" className="confirm" disabled={takedown.isPending} onClick={confirm}>
                {takedown.isPending ? consts.TAKEDOWN_SAVING_LABEL : consts.TAKEDOWN_CONFIRM_LABEL}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})`
  ${styles.TakedownDedicationButton}
`;
