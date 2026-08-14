import styled from 'styled-components';

import { CityPicker } from './components/CityPicker/CityPicker';
import { DateFilterChips } from './components/DateFilterChips/DateFilterChips';
import { SearchField } from './components/SearchField/SearchField';
import * as consts from './consts';
import type { HeaderProps } from './models';
import * as styles from './styles';

export const Header = styled(
  ({
    className,
    option,
    customDate,
    onSelectOption,
    onSelectCustomDate,
    city,
    onSelectCity,
    searchQuery,
    onSearchQueryChange,
  }: HeaderProps) => (
    <header className={className}>
      <div className="bar">
        <span className="wordmark" dir="auto">
          {consts.WORDMARK}
        </span>
        <DateFilterChips
          className="chips"
          {...{ option, customDate, onSelectOption, onSelectCustomDate }}
        />
        <SearchField className="search" value={searchQuery} onChange={onSearchQueryChange} />
        <CityPicker className="city" {...{ city, onSelectCity }} />
      </div>
    </header>
  ),
)`
  ${styles.Header}
`;
