import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminDedication } from '@torabarabim/common';

import { AdminApiError, createAdminDedication, updateAdminDedication } from '~/AdminPanel/api';

import { buildDedicationRequest } from './helpers';
import type { DedicationFormState } from './models';

export interface SaveDedicationResult {
  isSaving: boolean;
  error: AdminApiError | undefined;
  save: (form: DedicationFormState, existingId: string | undefined) => Promise<AdminDedication | undefined>;
}

export const useSaveDedication = (): SaveDedicationResult => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<AdminApiError | undefined>();

  const save = async (form: DedicationFormState, existingId: string | undefined): Promise<AdminDedication | undefined> => {
    setError(undefined);
    setIsSaving(true);

    const body = buildDedicationRequest(form);

    try {
      const dedication = existingId ? await updateAdminDedication(existingId, body) : await createAdminDedication(body);
      setIsSaving(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dedications'] });
      return dedication;
    } catch (caught) {
      setIsSaving(false);
      if (caught instanceof AdminApiError) {
        setError(caught);
        return undefined;
      }
      throw caught;
    }
  };

  return { isSaving, error, save };
};
