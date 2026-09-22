import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { directionForValue, rabbiDisplayName } from '~/helpers';
import { useRabbiDirectory } from '~/PlacePanel/useRabbiDirectory';

import * as consts from './consts';
import { filterRabbisByName } from './helpers';
import type { RabbiSelectProps } from './models';
import * as styles from './styles';

// A searchable rabbi combobox, filtering client-side over
// `useRabbiDirectory`'s already-fetched page rather than a server search
// (see `PlacePanel/api.ts`): a place names any rabbi it hosts, with no
// consent step (`common/src/place-portal.ts`).
export const RabbiSelect = styled(({ className, rabbi, onSelectRabbi, errorMessage }: RabbiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const directory = useRabbiDirectory();
  const results = filterRabbisByName(directory.items, query);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { open: isOpen, invalid: Boolean(errorMessage) })} onBlur={close}>
      <button type="button" className="control" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <span className="label" dir="auto">
          {rabbi ? rabbiDisplayName(rabbi) : consts.RABBI_SEARCH_PLACEHOLDER}
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

          {directory.isError && <p className="hint">{consts.RABBI_DIRECTORY_ERROR_MESSAGE}</p>}
          {!directory.isError && !directory.isPending && results.length === 0 && <p className="hint">{consts.RABBI_NO_RESULTS_MESSAGE}</p>}

          {results.length > 0 && (
            <ul className="results" role="listbox">
              {results.map((item) => (
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
