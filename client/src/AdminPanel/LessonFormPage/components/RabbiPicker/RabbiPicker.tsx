import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';

import type { RabbiPickerProps } from './models';
import * as styles from './styles';
import { useRabbiLessonCount } from './useRabbiLessonCount';
import { useRabbiSearch } from './useRabbiSearch';

export const RabbiPicker = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);
  const lessonCount = useRabbiLessonCount(rabbi?.id);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { open: isOpen, invalid: Boolean(errorMessage) })} onBlur={close}>
      <button type="button" className="control" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <span className="label" dir="auto">
          {rabbi?.name ?? parentConsts.RABBI_SEARCH_PLACEHOLDER}
        </span>
      </button>

      {rabbi && lessonCount.data && <p className="summary">{parentConsts.rabbiLessonCountLabel(lessonCount.data.total)}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <Link className="notListed" to={ADMIN_ROUTES.rabbiNew}>
        {parentConsts.RABBI_NOT_LISTED_NOTE}
      </Link>

      {isOpen && (
        <div className="popover">
          <input
            type="text"
            className="search"
            autoFocus
            aria-label={parentConsts.RABBI_SEARCH_LABEL}
            placeholder={parentConsts.RABBI_SEARCH_PLACEHOLDER}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            dir="auto"
          />

          {results.items.length > 0 && (
            <ul className="results" role="listbox">
              {results.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.id === rabbi?.id}
                    onClick={() => {
                      onSelectRabbi(item);
                      setQuery('');
                      setIsOpen(false);
                    }}
                  >
                    <span dir="auto">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
})`
  ${styles.RabbiPicker}
`;
