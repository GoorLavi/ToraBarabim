import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { CityPickerProps } from './models';
import * as styles from './styles';
import { useCitySearchResults } from './useCitySearchResults';

export const CityPicker = styled(({ className, city, onSelectCity }: CityPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useCitySearchResults(query);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { open: isOpen })} onBlur={close}>
      <button type="button" className="pill" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <svg className="pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="label" dir="auto">
          {city?.name ?? consts.ALL_AREAS_LABEL}
        </span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="popover">
          <input
            type="text"
            className="search"
            autoFocus
            aria-label={consts.SEARCH_LABEL}
            placeholder={consts.SEARCH_PLACEHOLDER}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            dir="auto"
          />

          {query.trim().length === 0 && <p className="hint">{consts.SEARCH_HINT}</p>}
          {query.trim().length > 0 && results.isPending && <p className="hint">{consts.LOADING_MESSAGE}</p>}
          {query.trim().length > 0 && !results.isPending && !results.isError && results.items.length === 0 && (
            <p className="hint">{consts.NO_RESULTS_MESSAGE}</p>
          )}

          {results.items.length > 0 && (
            <ul className="results" role="listbox">
              {results.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.id === city?.id}
                    onClick={() => {
                      onSelectCity({ id: item.id, name: item.name });
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
  ${styles.CityPicker}
`;
