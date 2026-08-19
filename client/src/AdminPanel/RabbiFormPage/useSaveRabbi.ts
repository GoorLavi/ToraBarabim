import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { RabbiResponse } from '@torabarabim/common';

import { AdminApiError, createAdminRabbi, updateAdminRabbi, uploadAdminRabbiPhoto } from '~/AdminPanel/api';

import type { RabbiFormState, SaveRabbiStep } from './models';

export interface SaveRabbiStepError {
  step: SaveRabbiStep;
  error: AdminApiError;
}

export interface SaveRabbiResult {
  isSaving: boolean;
  stepError: SaveRabbiStepError | undefined;
  // Tracks a rabbi created mid-flow whose photo upload then failed, so a
  // retry updates that same rabbi instead of creating a second one
  // (client/CLAUDE.md: `POST /v1/admin/rabbis` and the photo upload are two
  // separate calls, not one atomic "create with photo" endpoint).
  pendingRabbiId: string | undefined;
  save: (form: RabbiFormState, existingId: string | undefined) => Promise<RabbiResponse | undefined>;
}

export const useSaveRabbi = (): SaveRabbiResult => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [stepError, setStepError] = useState<SaveRabbiStepError | undefined>();
  const [pendingRabbiId, setPendingRabbiId] = useState<string | undefined>();

  const save = async (form: RabbiFormState, existingId: string | undefined): Promise<RabbiResponse | undefined> => {
    setStepError(undefined);
    setIsSaving(true);

    const rabbiId = existingId ?? pendingRabbiId;
    let rabbi: RabbiResponse;

    try {
      rabbi = rabbiId
        ? await updateAdminRabbi(rabbiId, { name: form.name.trim(), prominence: form.prominence })
        : await createAdminRabbi({ name: form.name.trim(), prominence: form.prominence });
      if (!rabbiId) setPendingRabbiId(rabbi.id);
    } catch (error) {
      setIsSaving(false);
      if (error instanceof AdminApiError) {
        setStepError({ step: 'name', error });
        return undefined;
      }
      throw error;
    }

    if (form.photoFile) {
      try {
        rabbi = await uploadAdminRabbiPhoto(rabbi.id, form.photoFile);
      } catch (error) {
        setIsSaving(false);
        if (error instanceof AdminApiError) {
          setStepError({ step: 'photo', error });
          return undefined;
        }
        throw error;
      }
    }

    setIsSaving(false);
    void queryClient.invalidateQueries({ queryKey: ['admin', 'rabbis'] });
    if (rabbiId) void queryClient.invalidateQueries({ queryKey: ['admin', 'rabbis', rabbiId] });
    return rabbi;
  };

  return { isSaving, stepError, pendingRabbiId, save };
};
