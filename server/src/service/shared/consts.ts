import type { Area, AudienceFilter, AudienceScope } from '@torabarabim/common';

import { toSlug } from './slug';

// Pagination defaults shared by every public list endpoint (lessons, rabbis).
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Literal tuples for the query schemas that accept these, mirroring the
// `satisfies` + exhaustiveness pattern in `db/schema/enums.ts`. Neither
// value is stored, so neither gets a Postgres enum.
export const AUDIENCE_SCOPES = ['general', 'women'] as const satisfies readonly AudienceScope[];
export const AUDIENCE_FILTERS = ['men', 'mixed'] as const satisfies readonly AudienceFilter[];

const audienceScopeExhaustivenessCheck: Record<AudienceScope, true> = { general: true, women: true };
void audienceScopeExhaustivenessCheck;

const audienceFilterExhaustivenessCheck: Record<AudienceFilter, true> = { men: true, mixed: true };
void audienceFilterExhaustivenessCheck;

// Hebrew label for each area, shared by anything that surfaces an area to a
// reader: the home rail's row title and the city directory's group heading.
export const AREA_NAMES_HE: Record<Area, string> = {
  north: 'הצפון',
  haifa: 'חיפה והקריות',
  sharon: 'השרון',
  center: 'המרכז',
  telAviv: 'תל אביב',
  jerusalem: 'ירושלים',
  shfela: 'השפלה',
  south: 'הדרום',
};

// The area service's own URL segment, shared by anything that resolves or
// links to an area: the area service itself and the city detail page, which
// links back to the area it belongs to.
export const toAreaSlug = (area: Area): string => toSlug(AREA_NAMES_HE[area]);
