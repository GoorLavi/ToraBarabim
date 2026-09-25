import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import type { Rabbi } from '@torabarabim/common';

import { useRabbiSearch } from '~/AdminPanel/useRabbiSearch';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import * as parentConsts from '../../consts';
import * as consts from './consts';
import type { CourseFilterBarProps } from './models';
import * as styles from './styles';

// Mirrors `LessonsListPage/components/LessonFilterBar`'s own shape: behind
// a "סינון · N" toggle on a phone, always open from `md` up. The rabbi
// filter is a real picker here, unlike that file's own rabbi chip (which
// only ever arrives from a "see all" link): this screen has no such link to
// arrive from.
export const CourseFilterBar = styled(
  ({ className, status, onSelectStatus, rabbi, onSelectRabbi, search, onSearchChange, onClear, activeFilterCount }: CourseFilterBarProps) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [rabbiQuery, setRabbiQuery] = useState('');
    const rabbiResults = useRabbiSearch(rabbiQuery);

    const selectRabbi = (item: Rabbi): void => onSelectRabbi({ id: item.id, name: item.name, honorific: item.honorific });

    return (
      <div className={className}>
        <button type="button" className="mobileToggle" aria-expanded={isPanelOpen} onClick={() => setIsPanelOpen((open) => !open)}>
          {parentConsts.FILTERS_TOGGLE_LABEL(activeFilterCount)}
        </button>

        <div className={classNames('panel', { open: isPanelOpen })}>
          <select
            className="status"
            aria-label={parentConsts.STATUS_FILTER_LABEL}
            value={status}
            onChange={(event) => {
              const { value } = event.target;
              if (value === 'all' || value === 'open' || value === 'full' || value === 'closed') onSelectStatus(value);
            }}
          >
            {parentConsts.STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {parentConsts.STATUS_FILTER_LABELS[option]}
              </option>
            ))}
          </select>

          <SearchSelect<Rabbi>
            query={rabbiQuery}
            items={rabbiResults.items}
            isPending={rabbiResults.isPending}
            isError={rabbiResults.isError}
            getItemKey={(item) => item.id}
            isSelected={(item) => item.id === rabbi?.id}
            onSelect={selectRabbi}
            onQueryChange={setRabbiQuery}
            renderTrigger={() => <span dir="auto">{rabbi ? rabbiDisplayName(rabbi) : parentConsts.RABBI_FILTER_PLACEHOLDER}</span>}
            renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
            searchLabel={parentConsts.RABBI_FILTER_PLACEHOLDER}
            searchPlaceholder={parentConsts.RABBI_FILTER_PLACEHOLDER}
            loadingMessage={consts.RABBI_SEARCH_LOADING_MESSAGE}
            emptyMessage={consts.RABBI_SEARCH_EMPTY_MESSAGE}
            loadErrorMessage={consts.RABBI_SEARCH_LOAD_ERROR_MESSAGE}
          />

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
  ${styles.CourseFilterBar}
`;
