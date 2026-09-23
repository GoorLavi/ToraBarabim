import { useState } from 'react';
import type { Place } from '@torabarabim/common';

import { InactiveTag } from '~/components/InactiveTag/InactiveTag';
import { SearchSelect } from '~/components/SearchSelect/SearchSelect';

import { placeAddressLine, toPickedPlace } from '../../helpers';
import * as parentConsts from '../../consts';
import { usePlaceSearch } from '../../usePlaceSearch';
import type { PickerControlProps } from './models';

// The picker's own control: a full-width, at-least-48px button that opens a
// popover with an autofocused search and 48px result rows, each carrying
// the place's name and its "street, city" on its own line so two same-named
// places in different cities are never a coin flip. States A, B and C
// (nothing chosen, chosen, chosen-but-now-inactive) all render through this
// one control: the "cancel selection" affordance is deliberately a sibling
// below it, never an "x" inside it, so an accidental tap near the 48px
// control cannot discard the choice. A thin `SearchSelect` wrapper: its own
// search hook and Hebrew copy, no styling of its own.
export const PickerControl = ({ className, place, onSelectPlace, onClearPlace }: PickerControlProps) => {
  const [query, setQuery] = useState('');
  const results = usePlaceSearch(query);

  return (
    <SearchSelect<Place>
      {...{ className }}
      twoLineOptions
      emphasizeTrigger={Boolean(place)}
      items={results.items}
      isPending={results.isPending}
      isError={results.isError}
      getItemKey={(item) => item.id}
      isSelected={(item) => item.id === place?.id}
      onSelect={(item) => onSelectPlace(toPickedPlace(item))}
      onQueryChange={setQuery}
      renderTrigger={() =>
        place ? (
          <>
            {place.name} {!place.isActive && <InactiveTag />}
          </>
        ) : (
          parentConsts.PICKER_PLACEHOLDER
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
      errorMessage={parentConsts.PICKER_SEARCH_ERROR_MESSAGE}
    >
      {place && (
        <button type="button" className="actionLink" aria-label={parentConsts.CANCEL_PLACE_ARIA_LABEL} onClick={onClearPlace}>
          {parentConsts.CANCEL_PLACE_LABEL}
        </button>
      )}
    </SearchSelect>
  );
};
