import styled from 'styled-components';

import { SiteLogoLink } from '~/components/SiteLogoLink/SiteLogoLink';

import { AudienceFilter } from '../AudienceFilter/AudienceFilter';
import { CityPicker } from '../CityPicker/CityPicker';
import { DateFilterChips } from '../DateFilterChips/DateFilterChips';
import { SearchField } from '../SearchField/SearchField';
import type { FilterFieldsGridProps } from './models';
import * as styles from './styles';

// The full set of header controls: logo, date chips, search field, the
// audience dropdown and the city picker. Rendered once in normal flow
// inside `FilterControls`, and again inside `PinnedHeaderBar`'s expand
// panel below `lg`. The audience button always sits at the end of the
// search row, growing the search field to fill the rest of it, at every
// width: the two travel together as one grid area rather than the button
// being repositioned per breakpoint.
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
    audienceFilter,
    onSelectAudienceFilter,
    onClearAudienceFilter,
  }: FilterFieldsGridProps) => (
    <div className={className}>
      <div className="logo">
        <SiteLogoLink />
      </div>
      <DateFilterChips className="chips" {...{ option, customDate, onSelectOption, onSelectCustomDate, onClearDate }} />
      <div className="searchRow">
        <SearchField className="search" {...{ value: searchQuery, onChange: onSearchQueryChange }} />
        <AudienceFilter
          {...{ filter: audienceFilter, onSelectFilter: onSelectAudienceFilter, onClearFilter: onClearAudienceFilter }}
        />
      </div>
      <CityPicker className="city" {...{ city, onSelectCity, onClearCity }} />
    </div>
  ),
)`
  ${styles.FilterFieldsGrid}
`;
