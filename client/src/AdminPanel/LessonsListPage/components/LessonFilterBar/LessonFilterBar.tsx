import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { CitySelect } from '~/AdminPanel/components/CitySelect/CitySelect';
import * as parentConsts from '~/AdminPanel/LessonsListPage/consts';

import type { LessonFilterBarProps } from './models';
import * as styles from './styles';

// On a phone the controls collapse behind a single "סינון · N" button
// (mobile-only for this screen, per the brief); on desktop the panel is
// always open, driven purely by the `@media` block in styles.ts.
export const LessonFilterBar = styled(
  ({ className, city, onSelectCity, recurrence, onSelectRecurrence, search, onSearchChange, onClear, activeFilterCount }: LessonFilterBarProps) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
      <div className={className}>
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
            dir="auto"
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
