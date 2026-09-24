import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import type { City } from '@torabarabim/common';

import { SearchSelect } from '~/components/SearchSelect/SearchSelect';

import * as consts from './consts';
import type { CitySelectProps } from './models';
import * as styles from './styles';
import { useCitySearch } from './useCitySearch';

// A labelled, searchable city combobox for the admin and rabbi panels: the
// counterpart to the public site's `CityPicker`, kept as its own component
// since it needs a "clear" affordance the public picker does not
// (client/CLAUDE.md).
export const CitySelect = styled(({ className, city, onSelectCity, placeholderLabel, allowClear, fullWidth, invalid }: CitySelectProps) => {
  const [query, setQuery] = useState('');
  const results = useCitySearch(query);

  return (
    <div className={classNames(className, { fullWidth })}>
      <SearchSelect<City>
        {...{ fullWidth, invalid, query }}
        showChevron
        items={results.items}
        isPending={results.isPending}
        isError={results.isError}
        getItemKey={(item) => item.id}
        isSelected={(item) => item.id === city?.id}
        onSelect={(item) => onSelectCity({ id: item.id, name: item.name })}
        onQueryChange={setQuery}
        renderTrigger={() => (
          <span className="truncate" dir="auto">
            {city?.name ?? placeholderLabel}
          </span>
        )}
        renderOption={(item) => <span dir="auto">{item.name}</span>}
        searchLabel={consts.SEARCH_LABEL}
        searchPlaceholder={consts.SEARCH_PLACEHOLDER}
        hint={consts.SEARCH_HINT}
        loadingMessage={consts.LOADING_MESSAGE}
        emptyMessage={consts.NO_RESULTS_MESSAGE}
        loadErrorMessage={consts.LOAD_ERROR_MESSAGE}
      />

      {allowClear && city && (
        <button type="button" className="clear" onClick={() => onSelectCity(undefined)}>
          {consts.CLEAR_LABEL}
        </button>
      )}
    </div>
  );
})`
  ${styles.CitySelect}
`;
