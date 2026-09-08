import styled from 'styled-components';

import { CityPicker } from '~/HomePage/components/Header/components/CityPicker/CityPicker';
import { DateFilterChips } from '~/HomePage/components/Header/components/DateFilterChips/DateFilterChips';
import { SearchField } from '~/HomePage/components/Header/components/SearchField/SearchField';

import type { FilterBandProps } from './models';
import * as styles from './styles';

// The same three filter controls the home page's header already ships
// (05-lessons.md: "This is the home page's existing filter header,
// reused"), laid out as this page's own three stacked rows rather than the
// home header's combined logo-and-filters band, since the logo already
// lives in the shared LessonPageHeader above this.
export const FilterBand = styled(
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
  }: FilterBandProps) => (
    <div className={className}>
      <div className="bar">
        <div className="cityRow">
          <CityPicker className="city" {...{ city, onSelectCity, onClearCity }} />
        </div>
        <div className="dateRow">
          <DateFilterChips className="dateChips" {...{ option, customDate, onSelectOption, onSelectCustomDate, onClearDate }} />
        </div>
        <div className="searchRow">
          <SearchField className="search" value={searchQuery} onChange={onSearchQueryChange} />
        </div>
      </div>
    </div>
  ),
)`
  ${styles.FilterBand}
`;
