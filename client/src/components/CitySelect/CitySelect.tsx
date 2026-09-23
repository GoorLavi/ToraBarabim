import { useState } from 'react';
import type { City } from '@torabarabim/common';

import { SearchSelect } from '~/components/SearchSelect/SearchSelect';

import * as consts from './consts';
import type { CitySelectProps } from './models';
import { useCitySearch } from './useCitySearch';

// A labelled, searchable city combobox for the admin and rabbi panels: the
// counterpart to the public site's `CityPicker`, kept as its own component
// since it needs a "clear" affordance the public picker does not
// (client/CLAUDE.md). A thin `SearchSelect` wrapper: its own search hook and
// Hebrew copy, no styling of its own.
export const CitySelect = ({ className, city, onSelectCity, placeholderLabel, allowClear, fullWidth, invalid }: CitySelectProps) => {
  const [query, setQuery] = useState('');
  const results = useCitySearch(query);

  return (
    <SearchSelect<City>
      {...{ className, fullWidth, invalid }}
      rowLayout
      showChevron
      truncateTrigger
      items={results.items}
      isPending={results.isPending}
      isError={results.isError}
      getItemKey={(item) => item.id}
      isSelected={(item) => item.id === city?.id}
      onSelect={(item) => onSelectCity({ id: item.id, name: item.name })}
      onQueryChange={setQuery}
      renderTrigger={() => city?.name ?? placeholderLabel}
      renderOption={(item) => <span dir="auto">{item.name}</span>}
      searchLabel={consts.SEARCH_LABEL}
      searchPlaceholder={consts.SEARCH_PLACEHOLDER}
      hint={consts.SEARCH_HINT}
      loadingMessage={consts.LOADING_MESSAGE}
      emptyMessage={consts.NO_RESULTS_MESSAGE}
      errorMessage={consts.LOAD_ERROR_MESSAGE}
    >
      {allowClear && city && (
        <button type="button" className="actionLink" onClick={() => onSelectCity(undefined)}>
          {consts.CLEAR_LABEL}
        </button>
      )}
    </SearchSelect>
  );
};
