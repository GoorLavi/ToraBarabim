import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { ActiveFiltersProvider } from '~/analytics/ActiveFiltersProvider';
import { FilterControls } from '~/components/FilterControls/FilterControls';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { Footer } from './components/Footer/Footer';
import type { LayoutProps } from './models';
import * as styles from './styles';

// The one place the header and footer are assembled for every public route:
// every routed page below `<Outlet />` renders only its own content.
// Scroll position is the router's own `<ScrollRestoration />` job now
// (rendered once in root.tsx), superseding this folder's old
// useScrollRestoration hook.
export const Layout = styled(({ className }: LayoutProps) => {
  const { option, customDate, selectOption, selectCustomDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();

  // Memoised so every `LessonCard` reading it through `ActiveFiltersContext`
  // does not re-render on every `Layout` render: a fresh object here would
  // change the context value even when none of the filters actually did.
  const filters = useMemo(
    () => ({ cityId: city?.id, cityName: city?.name, dateOption: option, date: customDate, query }),
    [city?.id, city?.name, option, customDate, query],
  );

  return (
    <ActiveFiltersProvider filters={filters}>
      <div className={className}>
        <FilterControls
          {...{
            option,
            customDate,
            onSelectOption: selectOption,
            onSelectCustomDate: selectCustomDate,
            onClearDate: clearDate,
            city,
            onSelectCity: selectCity,
            onClearCity: clearCity,
            searchQuery: query,
            onSearchQueryChange: setQuery,
          }}
        />

        <div className="body">
          <Outlet />
        </div>

        <Footer className="footer" />
      </div>
    </ActiveFiltersProvider>
  );
})`
  ${styles.Layout}
`;
