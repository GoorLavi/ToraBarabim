import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { Rabbi } from '@torabarabim/common';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiPickerProps } from './models';
import * as styles from './styles';
import { useRabbiLessonCount } from './useRabbiLessonCount';
import { useRabbiSearch } from './useRabbiSearch';

export const RabbiPicker = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiPickerProps) => {
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);
  const lessonCount = useRabbiLessonCount(rabbi?.id);

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
        renderTrigger={() => <span dir="auto">{rabbi ? rabbiDisplayName(rabbi) : parentConsts.RABBI_SEARCH_PLACEHOLDER}</span>}
        renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
        searchLabel={parentConsts.RABBI_SEARCH_LABEL}
        searchPlaceholder={parentConsts.RABBI_SEARCH_PLACEHOLDER}
        loadingMessage={consts.RABBI_SEARCH_LOADING_MESSAGE}
        emptyMessage={consts.RABBI_SEARCH_EMPTY_MESSAGE}
        loadErrorMessage={consts.RABBI_SEARCH_LOAD_ERROR_MESSAGE}
      />

      {rabbi && lessonCount.data && <p className="summary">{parentConsts.rabbiLessonCountLabel(lessonCount.data.total)}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
      <Link className="notListed" to={ADMIN_ROUTES.rabbiNew}>
        {parentConsts.RABBI_NOT_LISTED_NOTE}
      </Link>
    </div>
  );
})`
  ${styles.RabbiPicker}
`;
