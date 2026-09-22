import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { directionForValue, rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiSelectProps } from './models';
import * as styles from './styles';
import { useRabbiSearch } from './useRabbiSearch';

// A searchable rabbi combobox: a place names any rabbi it hosts, with no
// consent step (`common/src/place-portal.ts`).
export const RabbiSelect = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useRabbiSearch(query);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { open: isOpen, invalid: Boolean(errorMessage) })} onBlur={close}>
      <button type="button" className="control" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <span className="label" dir="auto">
          {rabbi ? rabbiDisplayName(rabbi) : consts.RABBI_SELECT_PLACEHOLDER}
        </span>
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {isOpen && (
        <div className="popover">
          <input
            type="text"
            className="search"
            autoFocus
            aria-label={consts.RABBI_SEARCH_LABEL}
            placeholder={consts.RABBI_SEARCH_PLACEHOLDER}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            dir={directionForValue(query)}
          />

          {results.isError && <p className="hint">{consts.RABBI_DIRECTORY_ERROR_MESSAGE}</p>}
          {!results.isError && !results.isPending && results.items.length === 0 && <p className="hint">{consts.RABBI_NO_RESULTS_MESSAGE}</p>}

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
  ${styles.RabbiSelect}
`;
