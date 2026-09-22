import type { AdminDedication } from '@torabarabim/common';

import { formatIsraeliDate } from '~/AdminPanel/helpers';

export const dedicationWindowLabel = (dedication: Pick<AdminDedication, 'startsOn' | 'endsOn'>): string =>
  `${formatIsraeliDate(dedication.startsOn)} – ${formatIsraeliDate(dedication.endsOn)}`;
