import styled from 'styled-components';

import { SiteLogoLink } from '~/components/SiteLogoLink/SiteLogoLink';

import { CityPicker } from '../CityPicker/CityPicker';
import { DateFilterChips } from '../DateFilterChips/DateFilterChips';
import { SearchField } from '../SearchField/SearchField';
import type { FilterFieldsGridProps } from './models';
import * as styles from './styles';

// The full set of header controls: logo, date chips, search field and city
// picker. Rendered once in normal flow inside `FilterControls`, and again
// inside `PinnedHeaderBar`'s expand panel below `lg`.
export const FilterFieldsGrid = styled(
  ({
    className,
    option,
    customDate,
    onSelectOption,
    onSelectCustomDate,
    onClearDate,
    city,
    onSelectCity,
    onClearCity,
    searchQuery,
    onSearchQueryChange,
  }: FilterFieldsGridProps) => (
    <div className={className}>
      <div className="logo">
        <SiteLogoLink />
      </div>
      <DateFilterChips
        className="chips"
        {...{ option, customDate, onSelectOption, onSelectCustomDate, onClearDate }}
      />
      <SearchField className="search" value={searchQuery} onChange={onSearchQueryChange} />
      <CityPicker className="city" {...{ city, onSelectCity, onClearCity }} />
    </div>
  ),
)`
  ${styles.FilterFieldsGrid}
`;
