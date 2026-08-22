import styled from 'styled-components';

import { CityPicker } from './components/CityPicker/CityPicker';
import { DateFilterChips } from './components/DateFilterChips/DateFilterChips';
import { LogoMark } from './components/LogoMark/LogoMark';
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
    onClearDate,
    city,
    onSelectCity,
    onClearCity,
    searchQuery,
    onSearchQueryChange,
  }: HeaderProps) => (
    <header className={className}>
      <div className="bar">
        <div className="logo">
          <LogoMark className="mark" size={consts.LOGO_MARK_SIZE} variant="onDark" />
          <span className="wordmark" dir="auto">
            {consts.WORDMARK}
          </span>
        </div>
        <DateFilterChips
          className="chips"
          {...{ option, customDate, onSelectOption, onSelectCustomDate, onClearDate }}
        />
        <SearchField className="search" value={searchQuery} onChange={onSearchQueryChange} />
        <CityPicker className="city" {...{ city, onSelectCity, onClearCity }} />
      </div>
    </header>
  ),
)`
  ${styles.Header}
`;
