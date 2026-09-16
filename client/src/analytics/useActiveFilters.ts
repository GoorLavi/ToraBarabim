import { useContext } from 'react';

import { ActiveFiltersContext } from './ActiveFiltersProvider';
import { EMPTY_ACTIVE_FILTERS } from './consts';
import type { ActiveFilters } from './models';

// Fails open: a render outside `ActiveFiltersProvider` (a story, or a future
// surface not yet wrapped by `Layout`) gets empty filters instead of a
// thrown error, because analytics must never white-screen a page.
export const useActiveFilters = (): ActiveFilters => useContext(ActiveFiltersContext) ?? EMPTY_ACTIVE_FILTERS;
