import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Rabbi } from '@torabarabim/common';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiPickerProps } from './models';
import { useRabbiLessonCount } from './useRabbiLessonCount';
import { useRabbiSearch } from './useRabbiSearch';

// A thin `SearchSelect` wrapper: its own search hook, lesson-count summary
// and "not listed" link, no styling of its own.
export const RabbiPicker = ({ className, rabbi, onSelectRabbi, errorMessage }: RabbiPickerProps) => {
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);
  const lessonCount = useRabbiLessonCount(rabbi?.id);

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
      renderTrigger={() => (rabbi ? rabbiDisplayName(rabbi) : parentConsts.RABBI_SEARCH_PLACEHOLDER)}
      renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
      searchLabel={parentConsts.RABBI_SEARCH_LABEL}
      searchPlaceholder={parentConsts.RABBI_SEARCH_PLACEHOLDER}
      loadingMessage={parentConsts.LOADING_MESSAGE}
      emptyMessage={consts.RABBI_SEARCH_EMPTY_MESSAGE}
      errorMessage={consts.RABBI_SEARCH_ERROR_MESSAGE}
    >
      {rabbi && lessonCount.data && <p className="summaryText">{parentConsts.rabbiLessonCountLabel(lessonCount.data.total)}</p>}
      {errorMessage && <p className="errorText">{errorMessage}</p>}
      <Link className="actionLink" to={ADMIN_ROUTES.rabbiNew}>
        {parentConsts.RABBI_NOT_LISTED_NOTE}
      </Link>
    </SearchSelect>
  );
};
