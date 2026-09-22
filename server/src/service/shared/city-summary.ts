import type { City } from '@torabarabim/common';

import type { AddressCityRow } from './address';
import { toSlug } from './slug';

export const toCitySummary = (row: AddressCityRow): City => ({
  id: String(row.code),
  name: row.nameHe,
  slug: toSlug(row.nameHe),
  area: row.area,
});
