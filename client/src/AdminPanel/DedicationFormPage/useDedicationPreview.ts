import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { DedicationHonorific, DedicationPreviewRequest, DedicationText, DedicationType, HonoredGender } from '@torabarabim/common';

import { previewAdminDedication } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

const DEBOUNCE_MS = 300;

export interface DedicationPreviewFields {
  type: DedicationType;
  honoredName: string;
  honorific: DedicationHonorific | undefined;
  honoredGender: HonoredGender;
  parentName: string;
  donorFamilyName: string;
  closingLineEnabled: boolean;
}

export interface DedicationPreviewState {
  // False before a type and a name both exist: no request has ever been
  // sent for the current draft, so the caller shows its own quiet line
  // rather than a loading or an empty state.
  canPreview: boolean;
  isPending: boolean;
  isError: boolean;
  text: DedicationText | undefined;
}

const toPreviewRequest = (fields: DedicationPreviewFields): DedicationPreviewRequest => ({
  type: fields.type,
  honoredName: fields.honoredName.trim(),
  honorific: fields.honorific,
  honoredGender: fields.honoredGender,
  parentName: fields.parentName.trim() || undefined,
  donorFamilyName: fields.donorFamilyName.trim() || undefined,
  closingLineEnabled: fields.closingLineEnabled,
});

// Debounces the live draft, then reads the preview through a query keyed on
// the debounced field values themselves (`ADMIN_QUERY_KEYS.dedicationPreview`):
// a later keystroke moves to a new key rather than racing the in-flight
// request for the old one, so no `AbortController` is needed.
// `placeholderData: keepPreviousData` keeps the last rendered preview on
// screen while the next one loads, instead of flashing back to nothing
// between keystrokes.
export const useDedicationPreview = (fields: DedicationPreviewFields): DedicationPreviewState => {
  const [debounced, setDebounced] = useState(fields);

  const { type, honoredName, honorific, honoredGender, parentName, donorFamilyName, closingLineEnabled } = fields;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced({ type, honoredName, honorific, honoredGender, parentName, donorFamilyName, closingLineEnabled }),
      DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [type, honoredName, honorific, honoredGender, parentName, donorFamilyName, closingLineEnabled]);

  const canPreview = Boolean(debounced.type) && Boolean(debounced.honoredName.trim());
  const requestBody = toPreviewRequest(debounced);

  const result = useQuery({
    queryKey: ADMIN_QUERY_KEYS.dedicationPreview(requestBody),
    queryFn: () => previewAdminDedication(requestBody),
    enabled: canPreview,
    placeholderData: keepPreviousData,
  });

  return { canPreview, isPending: canPreview && result.isPending, isError: canPreview && result.isError, text: result.data };
};
