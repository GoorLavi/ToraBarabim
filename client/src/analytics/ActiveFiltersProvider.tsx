import { createContext } from 'react';
import type { ReactNode } from 'react';

import type { ActiveFilters, ActiveFiltersProviderProps } from './models';

export const ActiveFiltersContext = createContext<ActiveFilters | undefined>(undefined);

// Fed by `Layout.tsx` from the three header filter hooks it already holds,
// so every component below it (`LessonCard`, `SearchField`) can read the
// currently active city, date and search filters without a new prop
// threaded through every layer in between.
export const ActiveFiltersProvider = ({ children, filters }: ActiveFiltersProviderProps): ReactNode => (
  <ActiveFiltersContext.Provider value={filters}>{children}</ActiveFiltersContext.Provider>
);
