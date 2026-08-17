import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { CitySelectProps } from './models';
import * as styles from './styles';
import { useAdminCitySearch } from './useAdminCitySearch';

// A labelled, searchable city combobox: the admin equivalent of the public
// site's `CityPicker`, kept as its own small component here since it needs
// a "clear" affordance the public picker does not (client/CLAUDE.md).
export const CitySelect = styled(({ className, city, onSelectCity, placeholderLabel, allowClear }: CitySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useAdminCitySearch(query);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { open: isOpen })} onBlur={close}>
      <button type="button" className="control" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <span className="label" dir="auto">
          {city?.name ?? placeholderLabel}
        </span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {allowClear && city && (
        <button type="button" className="clear" onClick={() => onSelectCity(undefined)}>
          {consts.CLEAR_LABEL}
        </button>
      )}

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
  ${styles.CitySelect}
`;
