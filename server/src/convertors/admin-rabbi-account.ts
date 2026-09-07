import type { RabbiAccountCreatedResponse, RabbiAccountResponse, ResetRabbiPasswordResponse } from '@torabarabim/common';

import type { CreatedRabbiAccountRecord, RabbiAccountRecord } from '../service/admin-rabbi-account/models';

export const toRabbiAccountResponse = (record: RabbiAccountRecord): RabbiAccountResponse => ({
  id: record.id,
  email: record.email,
  rabbiId: record.rabbiId,
  isActive: record.isActive,
});

export const toRabbiAccountCreatedResponse = (record: CreatedRabbiAccountRecord): RabbiAccountCreatedResponse => ({
  id: record.id,
  email: record.email,
  rabbiId: record.rabbiId,
  isActive: record.isActive,
  temporaryPassword: record.temporaryPassword,
});

export const toResetRabbiPasswordResponse = (temporaryPassword: string): ResetRabbiPasswordResponse => ({ temporaryPassword });
