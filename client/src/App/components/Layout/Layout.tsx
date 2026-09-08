import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { FilterControls } from '~/components/FilterControls/FilterControls';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { Footer } from './components/Footer/Footer';
import type { LayoutProps } from './models';
import * as styles from './styles';
import { useScrollRestoration } from './useScrollRestoration';

// The one place the header and footer are assembled for every public route:
// every routed page below `<Outlet />` renders only its own content.
export const Layout = styled(({ className }: LayoutProps) => {
  const { option, customDate, selectOption, selectCustomDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();

  useScrollRestoration();

  return (
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
  );
})`
  ${styles.Layout}
`;
