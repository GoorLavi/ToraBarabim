import { useState } from 'react';
import styled from 'styled-components';
import type { Rabbi } from '@torabarabim/common';

import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiSelectProps } from './models';
import * as styles from './styles';
import { useRabbiSearch } from './useRabbiSearch';

// A searchable rabbi combobox: a place names any rabbi it hosts, with no
// consent step (`common/src/place-portal.ts`).
export const RabbiSelect = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiSelectProps) => {
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);

  return (
    <div className={className}>
      <SearchSelect<Rabbi>
        {...{ query }}
        fullWidth
        invalid={Boolean(errorMessage)}
        items={results.items}
        isPending={results.isPending}
        isError={results.isError}
        getItemKey={(item) => item.id}
        isSelected={(item) => item.id === rabbi?.id}
        onSelect={onSelectRabbi}
        onQueryChange={setQuery}
        renderTrigger={() => <span dir="auto">{rabbi ? rabbiDisplayName(rabbi) : consts.RABBI_SELECT_PLACEHOLDER}</span>}
        renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
        searchLabel={consts.RABBI_SEARCH_LABEL}
        searchPlaceholder={consts.RABBI_SEARCH_PLACEHOLDER}
        loadingMessage={consts.RABBI_SEARCH_LOADING_MESSAGE}
        emptyMessage={consts.RABBI_SEARCH_EMPTY_MESSAGE}
        loadErrorMessage={consts.RABBI_SEARCH_LOAD_ERROR_MESSAGE}
      />

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
})`
  ${styles.RabbiSelect}
`;
