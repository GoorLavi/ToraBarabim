import { useState } from 'react';
import type { Rabbi } from '@torabarabim/common';

import * as parentConsts from '~/PlacePanel/LessonFormPage/consts';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiSelectProps } from './models';
import { useRabbiSearch } from './useRabbiSearch';

// A searchable rabbi combobox: a place names any rabbi it hosts, with no
// consent step (`common/src/place-portal.ts`). A thin `SearchSelect`
// wrapper: its own search hook and Hebrew copy, no styling of its own.
export const RabbiSelect = ({ className, rabbi, onSelectRabbi, errorMessage }: RabbiSelectProps) => {
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);

  return (
    <SearchSelect<Rabbi>
      {...{ className }}
      invalid={Boolean(errorMessage)}
      items={results.items}
      isPending={results.isPending}
      isError={results.isError}
      getItemKey={(item) => item.id}
      isSelected={(item) => item.id === rabbi?.id}
      onSelect={onSelectRabbi}
      onQueryChange={setQuery}
      renderTrigger={() => (rabbi ? rabbiDisplayName(rabbi) : consts.RABBI_SELECT_PLACEHOLDER)}
      renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
      searchLabel={consts.RABBI_SEARCH_LABEL}
      searchPlaceholder={consts.RABBI_SEARCH_PLACEHOLDER}
      loadingMessage={parentConsts.LOADING_MESSAGE}
      emptyMessage={consts.RABBI_NO_RESULTS_MESSAGE}
      errorMessage={consts.RABBI_DIRECTORY_ERROR_MESSAGE}
    >
      {errorMessage && <p className="errorText">{errorMessage}</p>}
    </SearchSelect>
  );
};
