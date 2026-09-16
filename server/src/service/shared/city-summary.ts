import type { City } from '@torabarabim/common';

import type { PlaceCityRow } from './place';
import { toSlug } from './slug';

export const toCitySummary = (row: PlaceCityRow): City => ({
  id: String(row.code),
  name: row.nameHe,
  slug: toSlug(row.nameHe),
  area: row.area,
});
