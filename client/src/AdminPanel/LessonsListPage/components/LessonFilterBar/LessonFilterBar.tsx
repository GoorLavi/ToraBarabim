import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/LessonsListPage/consts';
import { CitySelect } from '~/components/CitySelect/CitySelect';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import type { LessonFilterBarProps } from './models';
import * as styles from './styles';

// On a phone the controls collapse behind a single "סינון · N" button
// (mobile-only for this screen, per the brief); on desktop the panel is
// always open, driven purely by the `@media` block in styles.ts. The rabbi
// chip is the exception: unlike city, recurrence and search, there is no
// picker for it here (a rabbi filter only ever arrives via URL, from
// `RabbiViewPage`'s "see all" link), so it renders outside the collapsible
// panel and stays visible whichever state the panel is in.
export const LessonFilterBar = styled(
  ({
    className,
    city,
    onSelectCity,
    rabbi,
    onClearRabbi,
    recurrence,
    onSelectRecurrence,
    search,
    onSearchChange,
    onClear,
    activeFilterCount,
  }: LessonFilterBarProps) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
      <div className={className}>
        {rabbi && (
          <button type="button" className="rabbiChip" aria-label={parentConsts.rabbiChipRemoveLabel(rabbiDisplayName(rabbi))} onClick={onClearRabbi}>
            <span dir="auto">{rabbiDisplayName(rabbi)}</span>
            <svg className="clearGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <button
          type="button"
          className="mobileToggle"
          aria-expanded={isPanelOpen}
          onClick={() => setIsPanelOpen((open) => !open)}
        >
          {parentConsts.FILTERS_TOGGLE_LABEL(activeFilterCount)}
        </button>

        <div className={classNames('panel', { open: isPanelOpen })}>
          <span className="sort">{parentConsts.SORT_LABEL}</span>

          <CitySelect city={city} onSelectCity={onSelectCity} placeholderLabel={parentConsts.CITY_FILTER_PLACEHOLDER} allowClear />

          <select
            className="recurrence"
            aria-label={parentConsts.RECURRENCE_FILTER_LABEL}
            value={recurrence}
            onChange={(event) => {
              const { value } = event.target;
              if (value === 'all' || value === 'weekly' || value === 'once') onSelectRecurrence(value);
            }}
          >
            {parentConsts.RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="search"
            className="search"
            dir={directionForValue(search)}
            aria-label={parentConsts.SEARCH_LABEL}
            placeholder={parentConsts.SEARCH_PLACEHOLDER}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          {activeFilterCount > 0 && (
            <button type="button" className="clear" onClick={onClear}>
              {parentConsts.CLEAR_FILTERS_LABEL}
            </button>
          )}
        </div>
      </div>
    );
  },
)`
  ${styles.LessonFilterBar}
`;
