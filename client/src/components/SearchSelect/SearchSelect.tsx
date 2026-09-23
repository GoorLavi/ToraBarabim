import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { directionForValue } from '~/helpers';
import { useDismissPopover } from '~/hooks/useDismissPopover';

import type { SearchSelectProps } from './models';
import * as styles from './styles';

function SearchSelectComponent<T>({
  className,
  items,
  isPending,
  isError,
  getItemKey,
  isSelected,
  onSelect,
  renderTrigger,
  renderOption,
  onQueryChange,
  searchLabel,
  searchPlaceholder,
  hint,
  loadingMessage,
  emptyMessage,
  errorMessage,
  children,
  rowLayout,
  fullWidth,
  invalid,
  showChevron,
  truncateTrigger,
  emphasizeTrigger,
  twoLineOptions,
}: SearchSelectProps<T>): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismissPopover({ isOpen, rootRef, triggerRef, onDismiss: () => setIsOpen(false) });

  const selectItem = (item: T): void => {
    onSelect(item);
    setQuery('');
    onQueryChange('');
    setIsOpen(false);
  };

  const queryIsEmpty = query.trim().length === 0;
  const showHint = Boolean(hint) && queryIsEmpty;

  return (
    <div className={classNames(className, { open: isOpen, rowLayout, fullWidth, invalid })} ref={rootRef}>
      <button
        type="button"
        className="control"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={classNames('triggerLabel', { truncate: truncateTrigger, emphasized: emphasizeTrigger })} dir="auto">
          {renderTrigger()}
        </span>
        {showChevron && (
          <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="popover">
          <input
            type="text"
            className="search"
            autoFocus
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onQueryChange(event.target.value);
            }}
            dir={directionForValue(query)}
          />

          {showHint && <p className="hint">{hint}</p>}
          {!showHint && isPending && <p className="hint">{loadingMessage}</p>}
          {!showHint && !isPending && isError && <p className="hint">{errorMessage}</p>}
          {!showHint && !isPending && !isError && items.length === 0 && <p className="hint">{emptyMessage}</p>}

          {items.length > 0 && (
            <ul className={classNames('results', { twoLine: twoLineOptions })} role="listbox">
              {items.map((item) => (
                <li key={getItemKey(item)}>
                  <button type="button" role="option" aria-selected={isSelected(item)} onClick={() => selectItem(item)}>
                    {renderOption(item)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

const StyledSearchSelect = styled(SearchSelectComponent)`
  ${styles.SearchSelect}
`;

// styled-components' typings resolve a wrapped component's props at the
// call site, which erases a generic component's own type parameter; the
// cast restores it on the exported symbol while `SearchSelectComponent`
// above stays the real, generic source of truth.
export const SearchSelect = StyledSearchSelect as unknown as <T>(props: SearchSelectProps<T>) => ReactNode;
