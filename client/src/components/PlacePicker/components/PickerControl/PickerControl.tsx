import { useState } from 'react';
import styled from 'styled-components';
import type { Place } from '@torabarabim/common';

import { InactiveTag } from '~/components/InactiveTag/InactiveTag';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';

import { placeAddressLine, toPickedPlace } from '../../helpers';
import * as parentConsts from '../../consts';
import { usePlaceSearch } from '../../usePlaceSearch';
import type { PickerControlProps } from './models';
import * as styles from './styles';

// The picker's own control: a full-width, at-least-48px button that opens a
// popover with an autofocused search and 48px result rows, each carrying
// the place's name and its "street, city" on its own line so two same-named
// places in different cities are never a coin flip. States A, B and C
// (nothing chosen, chosen, chosen-but-now-inactive) all render through this
// one control: the "cancel selection" affordance is deliberately a sibling
// below it, never an "x" inside it, so an accidental tap near the 48px
// control cannot discard the choice.
export const PickerControl = styled(({ className, place, onSelectPlace, onClearPlace }: PickerControlProps) => {
  const [query, setQuery] = useState('');
  const results = usePlaceSearch(query);

  return (
    <div className={className}>
      <SearchSelect<Place>
        {...{ query }}
        fullWidth
        items={results.items}
        isPending={results.isPending}
        isError={results.isError}
        getItemKey={(item) => item.id}
        isSelected={(item) => item.id === place?.id}
        onSelect={(item) => onSelectPlace(toPickedPlace(item))}
        onQueryChange={setQuery}
        renderTrigger={() =>
          place ? (
            <span className="triggerPrimary name" dir="auto">
              {place.name}
              {!place.isActive && <InactiveTag />}
            </span>
          ) : (
            <span dir="auto">{parentConsts.PICKER_PLACEHOLDER}</span>
          )
        }
        renderOption={(item) => (
          <>
            <span className="optionPrimary" dir="auto">
              {item.name}
            </span>
            <span className="optionSecondary" dir="auto">
              {placeAddressLine(item.street, item.city)}
            </span>
          </>
        )}
        searchLabel={parentConsts.PICKER_SEARCH_LABEL}
        searchPlaceholder={parentConsts.PICKER_PLACEHOLDER}
        loadingMessage={parentConsts.PICKER_SEARCH_LOADING_MESSAGE}
        emptyMessage={parentConsts.PICKER_SEARCH_EMPTY_MESSAGE}
        loadErrorMessage={parentConsts.PICKER_SEARCH_LOAD_ERROR_MESSAGE}
      />

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
