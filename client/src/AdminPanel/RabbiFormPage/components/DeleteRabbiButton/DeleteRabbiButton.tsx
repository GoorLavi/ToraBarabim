import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import { deleteAdminRabbi, fetchAdminRabbiDeletePreview } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import * as parentConsts from '~/AdminPanel/RabbiFormPage/consts';

import type { DeleteRabbiButtonProps } from './models';
import * as styles from './styles';

// The delete-preview-then-confirm flow is a deliberate, human-approved
// product decision: cascade delete, no soft delete (see the report for
// this slice). `GET /v1/admin/rabbis/:id/delete-preview` runs first so the
// confirm dialog can name exactly what will be destroyed.
export const DeleteRabbiButton = styled(({ className, rabbiId, onDeleted }: DeleteRabbiButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const preview = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbiDeletePreview(rabbiId),
    queryFn: () => fetchAdminRabbiDeletePreview(rabbiId),
    enabled: isDialogOpen,
  });

  const remove = useMutation({
    mutationFn: () => deleteAdminRabbi(rabbiId, true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'rabbis'] });
      onDeleted();
    },
  });

  return (
    <div className={className}>
      <button type="button" className="deleteTrigger" onClick={() => setIsDialogOpen(true)}>
        {parentConsts.DELETE_LABEL}
      </button>

      {isDialogOpen && (
        <div className="overlay" role="presentation" onClick={() => !remove.isPending && setIsDialogOpen(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2 className="heading">{parentConsts.DELETE_CONFIRM_HEADING}</h2>

            {preview.isPending && <p className="message">{parentConsts.DELETE_PREVIEW_LOADING_MESSAGE}</p>}
            {preview.isError && <p className="message error">{adminErrorMessage(preview.error)}</p>}
            {preview.data && (
              <p className="message">{parentConsts.deleteConfirmImpactLabel(preview.data.lessonCount, preview.data.exceptionCount)}</p>
            )}
            <p className="irreversible">{parentConsts.DELETE_CONFIRM_IRREVERSIBLE_NOTE}</p>

            {remove.isError && <p className="message error">{adminErrorMessage(remove.error)}</p>}

            <div className="actions">
              <button type="button" className="cancel" disabled={remove.isPending} onClick={() => setIsDialogOpen(false)}>
                {parentConsts.DELETE_CONFIRM_CANCEL_LABEL}
              </button>
              <button type="button" className="confirm" disabled={!preview.data || remove.isPending} onClick={() => remove.mutate()}>
                {parentConsts.DELETE_CONFIRM_CONFIRM_LABEL}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})`
  ${styles.DeleteRabbiButton}
`;
