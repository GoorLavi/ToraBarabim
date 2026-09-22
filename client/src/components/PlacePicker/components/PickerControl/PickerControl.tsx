import { useState } from 'react';
import type { FocusEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { InactiveTag } from '~/components/InactiveTag/InactiveTag';
import { directionForValue } from '~/helpers';

import { placeAddressLine, toPickedPlace } from '../../helpers';
import * as parentConsts from '../../consts';
import { usePlaceSearch } from '../../usePlaceSearch';
import type { PickerControlProps } from './models';
import * as styles from './styles';

// The picker's own control, `RabbiPicker`'s exact shape: a full-width,
// at-least-48px button that opens a popover with an autofocused search and
// 48px result rows, each carrying the place's name and its "street, city"
// on its own line so two same-named places in different cities are never a
// coin flip. States A, B and C (nothing chosen, chosen, chosen-but-now-
// inactive) all render through this one control: the "cancel selection"
// affordance is deliberately a sibling below it, never an `×` inside it, so
// an accidental tap near the 48px control cannot discard the choice.
export const PickerControl = styled(({ className, place, onSelectPlace, onClearPlace }: PickerControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = usePlaceSearch(query);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className={classNames(className, { chosen: Boolean(place) })}>
      <div className={classNames('field', { open: isOpen })} onBlur={close}>
        <button type="button" className="control" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
          {place ? (
            <span className="name" dir="auto">
              {place.name}
              {!place.isActive && <InactiveTag />}
            </span>
          ) : (
            <span className="label">{parentConsts.PICKER_PLACEHOLDER}</span>
          )}
        </button>

        {isOpen && (
          <div className="popover">
            <input
              type="text"
              className="search"
              autoFocus
              aria-label={parentConsts.PICKER_SEARCH_LABEL}
              placeholder={parentConsts.PICKER_PLACEHOLDER}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              dir={directionForValue(query)}
            />

            {results.length > 0 && (
              <ul className="results" role="listbox">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={item.id === place?.id}
                      onClick={() => {
                        onSelectPlace(toPickedPlace(item));
                        setQuery('');
                        setIsOpen(false);
                      }}
                    >
                      <span className="name" dir="auto">
                        {item.name}
                      </span>
                      <span className="address" dir="auto">
                        {placeAddressLine(item.street, item.city)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {place && (
        <button type="button" className="clearPlace" aria-label={parentConsts.CANCEL_PLACE_ARIA_LABEL} onClick={onClearPlace}>
          {parentConsts.CANCEL_PLACE_LABEL}
        </button>
      )}
    </div>
  );
})`
  ${styles.PickerControl}
`;
