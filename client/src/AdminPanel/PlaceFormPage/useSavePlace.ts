import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminPlaceResponse } from '@torabarabim/common';

import { AdminApiError, createAdminPlace, updateAdminPlace, uploadAdminPlacePhoto } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import { nullableTextField } from '~/AdminPanel/helpers';

import type { PlaceFormState, SavePlaceStep } from './models';

export interface SavePlaceStepError {
  step: SavePlaceStep;
  error: AdminApiError;
}

export interface SavePlaceResult {
  isSaving: boolean;
  stepError: SavePlaceStepError | undefined;
  // Tracks a place created mid-flow whose photo upload then failed, so a
  // retry updates that same place instead of creating a second one
  // (mirrors `RabbiFormPage/useSaveRabbi.ts`: the create and the photo
  // upload are two separate calls, not one atomic "create with photo"
  // endpoint).
  pendingPlaceId: string | undefined;
  save: (form: PlaceFormState, existingId: string | undefined) => Promise<AdminPlaceResponse | undefined>;
}

export const useSavePlace = (): SavePlaceResult => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [stepError, setStepError] = useState<SavePlaceStepError | undefined>();
  const [pendingPlaceId, setPendingPlaceId] = useState<string | undefined>();

  const save = async (form: PlaceFormState, existingId: string | undefined): Promise<AdminPlaceResponse | undefined> => {
    if (!form.city) throw new Error('useSavePlace.save called before the form passed validation');

    setStepError(undefined);
    setIsSaving(true);

    const placeId = existingId ?? pendingPlaceId;
    let place: AdminPlaceResponse;

    try {
      place = placeId
        ? await updateAdminPlace(placeId, {
            name: form.name.trim(),
            street: form.street.trim(),
            floor: nullableTextField(form.floor, form.existingFloor),
            cityCode: Number(form.city.id),
            isActive: form.isActive,
          })
        : await createAdminPlace({
            name: form.name.trim(),
            street: form.street.trim(),
            floor: form.floor.trim() || undefined,
            cityCode: Number(form.city.id),
          });
      if (!placeId) setPendingPlaceId(place.id);
    } catch (error) {
      setIsSaving(false);
      if (error instanceof AdminApiError) {
        setStepError({ step: 'fields', error });
        return undefined;
      }
      throw error;
    }

    if (form.photoFile) {
      try {
        place = await uploadAdminPlacePhoto(place.id, form.photoFile);
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
    void queryClient.invalidateQueries({ queryKey: ['admin', 'places'] });
    if (placeId) void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.place(placeId) });
    return place;
  };

  return { isSaving, stepError, pendingPlaceId, save };
};
