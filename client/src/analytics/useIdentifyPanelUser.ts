import { useEffect } from 'react';

import { identifyPanelUser } from './mixpanel';
import type { PanelUserIdentity } from './models';

// Keyed on the identity's fields, not the object: a shell builds a fresh one
// on every render, and keying on it would identify again each time. An edited
// name still changes a field, which is what refreshes the profile.
export const useIdentifyPanelUser = (identity: PanelUserIdentity | undefined): void => {
  const role = identity?.role;
  const accountId = identity?.accountId;
  const name = identity?.name;
  const rabbiId = identity?.role === 'rabbi' ? identity.rabbiId : undefined;
  const placeId = identity?.role === 'place' ? identity.placeId : undefined;

  useEffect(() => {
    if (accountId === undefined || name === undefined) return;
    if (role === 'rabbi' && rabbiId !== undefined) identifyPanelUser({ role, accountId, name, rabbiId });
    if (role === 'place' && placeId !== undefined) identifyPanelUser({ role, accountId, name, placeId });
  }, [role, accountId, name, rabbiId, placeId]);
};
