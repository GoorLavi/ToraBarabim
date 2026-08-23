import type { RabbiProfileResponse } from '@torabarabim/common';

import type { RabbiProfileRecord } from '../service/rabbi-profile/models';

// Never sends `prominence`: `RabbiProfileRecord` never carries it in the
// first place, so there is nothing here that could leak it.
export const toRabbiProfileResponse = (record: RabbiProfileRecord): RabbiProfileResponse => ({
  id: record.id,
  name: record.name,
  title: record.title,
  photoUrl: record.photoUrl,
  bio: record.bio,
});
