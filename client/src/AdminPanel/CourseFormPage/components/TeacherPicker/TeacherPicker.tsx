import { useState } from 'react';
import styled from 'styled-components';
import type { Rabbi } from '@torabarabim/common';

import { useRabbiSearch } from '~/AdminPanel/useRabbiSearch';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { TeacherPickerProps } from './models';
import * as styles from './styles';

// The course's own teacher: a search over registered rabbis, with a
// hairline "או" fork to a free-text name below it, the same shape
// `PlacePicker`'s own venue picker uses for the same reason (picking one
// arm locks the other rather than leaving a live choice open). Never a
// third "not chosen" state (`models.ts`): the free-text arm with a blank
// name is "nothing chosen yet".
export const TeacherPicker = styled(({ className, teacher, onChangeTeacher, errorMessage }: TeacherPickerProps) => {
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
        isSelected={(item) => teacher.kind === 'rabbi' && item.id === teacher.rabbi.id}
        onSelect={(rabbi) => onChangeTeacher({ kind: 'rabbi', rabbi })}
        onQueryChange={setQuery}
        renderTrigger={() => <span dir="auto">{consts.SEARCH_PLACEHOLDER}</span>}
        renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
        searchLabel={consts.SEARCH_LABEL}
        searchPlaceholder={consts.SEARCH_PLACEHOLDER}
        loadingMessage={consts.SEARCH_LOADING_MESSAGE}
        emptyMessage={consts.SEARCH_EMPTY_MESSAGE}
        loadErrorMessage={consts.SEARCH_LOAD_ERROR_MESSAGE}
      />

      {teacher.kind === 'named' && (
        <div className="orDivider" aria-hidden="true">
          <span className="line" />
          <span className="label">{consts.OR_LABEL}</span>
          <span className="line" />
        </div>
      )}

      {teacher.kind === 'rabbi' ? (
        <div className="lockedRow">
          <ReadOnlyField quiet value={rabbiDisplayName(teacher.rabbi)} />
          <button type="button" className="clearSelection" onClick={() => onChangeTeacher({ kind: 'named', name: '' })}>
            {consts.CLEAR_SELECTION_LABEL}
          </button>
        </div>
      ) : (
        <label className="field">
          <span className="label">{consts.NAMED_LABEL}</span>
          <input
            type="text"
            className="input"
            dir={directionForValue(teacher.name)}
            value={teacher.name}
            onChange={(event) => onChangeTeacher({ kind: 'named', name: event.target.value })}
          />
          <span className="helper">{consts.NAMED_HELP}</span>
        </label>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
})`
  ${styles.TeacherPicker}
`;
