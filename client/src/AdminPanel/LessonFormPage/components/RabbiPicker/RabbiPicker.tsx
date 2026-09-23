import { useRef, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';
import { directionForValue, rabbiDisplayName } from '~/helpers';
import { useDismissPopover } from '~/hooks/useDismissPopover';

import type { RabbiPickerProps } from './models';
import * as styles from './styles';
import { useRabbiLessonCount } from './useRabbiLessonCount';
import { useRabbiSearch } from './useRabbiSearch';

export const RabbiPicker = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);
  const lessonCount = useRabbiLessonCount(rabbi?.id);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismissPopover({ isOpen, rootRef, triggerRef, onDismiss: () => setIsOpen(false) });

  return (
    <div className={classNames(className, { open: isOpen, invalid: Boolean(errorMessage) })} ref={rootRef}>
      <button
        type="button"
        className="control"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="label" dir="auto">
          {rabbi ? rabbiDisplayName(rabbi) : parentConsts.RABBI_SEARCH_PLACEHOLDER}
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
            dir={directionForValue(query)}
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
                    <span dir="auto">{rabbiDisplayName(item)}</span>
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
