import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import type { Rabbi } from '@torabarabim/common';

import { useRabbiSearch } from '~/AdminPanel/useRabbiSearch';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { TeacherPickerProps } from './models';
import * as styles from './styles';

type Mode = 'search' | 'named';

// A course's teacher is a registered rabbi or a free-text name, never a
// third "not chosen" state (`models.ts`): the toggle below only decides
// which arm of `teacher` the next edit writes, since a course with a
// `named` teacher that carries no live rabbi link (design brief B, the
// editor's "אין קישור לרב" wording) opens straight into that same free-text
// mode, pre-filled, rather than a search box with nothing in it.
export const TeacherPicker = styled(({ className, teacher, onChangeTeacher, errorMessage }: TeacherPickerProps) => {
  // Read once, at mount: this component is always fed an already-loaded
  // `teacher` (the parent's own form only renders it once a create's blank
  // state or an edit's loaded course is known), so the mode this starts in
  // is always the right one. A later external reset of `teacher` (there is
  // none today) would need this to become a controlled prop instead.
  const [mode, setMode] = useState<Mode>(() => (teacher.kind === 'rabbi' ? 'search' : 'named'));
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);

  return (
    <div className={className}>
      <div className="modeToggle" role="radiogroup">
        <button
          type="button"
          className={classNames('modeOption', { selected: mode === 'search' })}
          role="radio"
          aria-checked={mode === 'search'}
          onClick={() => setMode('search')}
        >
          {consts.SEARCH_MODE_LABEL}
        </button>
        <button
          type="button"
          className={classNames('modeOption', { selected: mode === 'named' })}
          role="radio"
          aria-checked={mode === 'named'}
          onClick={() => setMode('named')}
        >
          {consts.NAMED_MODE_LABEL}
        </button>
      </div>

      {mode === 'search' ? (
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
          renderTrigger={() => <span dir="auto">{teacher.kind === 'rabbi' ? rabbiDisplayName(teacher.rabbi) : consts.SEARCH_PLACEHOLDER}</span>}
          renderOption={(item) => <span dir="auto">{rabbiDisplayName(item)}</span>}
          searchLabel={consts.SEARCH_LABEL}
          searchPlaceholder={consts.SEARCH_PLACEHOLDER}
          loadingMessage={consts.SEARCH_LOADING_MESSAGE}
          emptyMessage={consts.SEARCH_EMPTY_MESSAGE}
          loadErrorMessage={consts.SEARCH_LOAD_ERROR_MESSAGE}
        />
      ) : (
        <label className="field">
          <span className="label">{consts.NAMED_LABEL}</span>
          <input
            type="text"
            className="input"
            dir={directionForValue(teacher.kind === 'named' ? teacher.name : '')}
            value={teacher.kind === 'named' ? teacher.name : ''}
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
