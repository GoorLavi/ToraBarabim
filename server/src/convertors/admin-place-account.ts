import type { PlaceAccountCreatedResponse, PlaceAccountResponse, ResetPlacePasswordResponse } from '@torabarabim/common';

import type { CreatedPlaceAccountRecord, PlaceAccountRecord } from '../service/admin-place/models';

export const toPlaceAccountResponse = (record: PlaceAccountRecord): PlaceAccountResponse => ({
  id: record.id,
  email: record.email,
  username: record.username,
  placeId: record.placeId,
  isActive: record.isActive,
});

export const toPlaceAccountCreatedResponse = (record: CreatedPlaceAccountRecord): PlaceAccountCreatedResponse => ({
  id: record.id,
  email: record.email,
  username: record.username,
  placeId: record.placeId,
  isActive: record.isActive,
  temporaryPassword: record.temporaryPassword,
});

export const toResetPlacePasswordResponse = (temporaryPassword: string): ResetPlacePasswordResponse => ({ temporaryPassword });
