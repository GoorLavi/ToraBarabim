import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { CitySelect } from '~/components/CitySelect/CitySelect';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { directionForValue } from '~/helpers';

import { DuplicateHint } from './components/DuplicateHint/DuplicateHint';
import { PickerControl } from './components/PickerControl/PickerControl';
import * as consts from './consts';
import { toPickedPlace } from './helpers';
import type { PickedPlace, PlacePickerProps } from './models';
import * as styles from './styles';
import { useSimilarPlaceHint } from './useSimilarPlaceHint';

// The venue section of both lesson forms: a search over registered places,
// with a hairline `או` fork to a free-text address below it. Nothing here
// blocks on the other: picking a place locks the address fields (state B or,
// for a place later deactivated on an already-saved lesson, state C);
// leaving the picker empty keeps the address fields open (state A). See the
// slice's report for the full state-by-state design.
export const PlacePicker = styled(({ className, venue, onChangeVenue, city, onSelectCity, cityError, nameError, streetError }: PlacePickerProps) => {
  const [lastEditedField, setLastEditedField] = useState<'name' | 'street'>('name');

  const cityCode = city ? Number(city.id) : undefined;
  const name = venue.kind === 'address' ? venue.name : '';
  const street = venue.kind === 'address' ? venue.street : '';
  const hint = useSimilarPlaceHint(cityCode, name, street);
  const hintMatch = hint.match;

  const selectPlace = (place: PickedPlace): void => onChangeVenue({ kind: 'place', place });
  const clearPlace = (): void => onChangeVenue({ kind: 'address', name: '', street: '', floor: '' });
  const confirmHint = (): void => {
    if (hintMatch) selectPlace(toPickedPlace(hintMatch));
  };

  return (
    <div className={className}>
      <p className="helper">{consts.HELPER_LINE}</p>

      <PickerControl place={venue.kind === 'place' ? venue.place : undefined} onSelectPlace={selectPlace} onClearPlace={clearPlace} />

      {/* Once a place is chosen there is no live fork any more: the address
          fields below are that same place's own, locked, not a real
          alternative "או" would promise (design gate finding, PlacePicker
          nits: "'או' still between them implying the other arm is
          available"). */}
      {venue.kind === 'address' && (
        <div className="orDivider" aria-hidden="true">
          <span className="line" />
          <span className="label">{consts.OR_LABEL}</span>
          <span className="line" />
        </div>
      )}

      {venue.kind === 'place' ? (
        <>
          <p className="reason">{consts.LOCKED_REASON}</p>
          <ReadOnlyField quiet label={consts.CITY_LABEL} value={venue.place.city} />
          <ReadOnlyField quiet label={consts.PLACE_NAME_LABEL} value={venue.place.name} />
          <ReadOnlyField quiet label={consts.STREET_LABEL} value={venue.place.street} />
          {venue.place.floor && <ReadOnlyField quiet label={consts.FLOOR_LABEL} value={venue.place.floor} />}
        </>
      ) : (
        <>
          <div className="field">
            <span className="label">{consts.CITY_LABEL}</span>
            <CitySelect city={city} onSelectCity={onSelectCity} placeholderLabel={consts.CITY_PLACEHOLDER} fullWidth invalid={Boolean(cityError)} />
            <span className="helper">{consts.CITY_HELPER}</span>
            {cityError && <span className="error">{cityError}</span>}
          </div>

          <label className={classNames('field', { hasError: Boolean(nameError) })}>
            <span className="label">{consts.PLACE_NAME_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(venue.name)}
              value={venue.name}
              onChange={(event) => {
                setLastEditedField('name');
                onChangeVenue({ ...venue, name: event.target.value });
              }}
            />
            {nameError && <span className="error">{nameError}</span>}
          </label>
          {hintMatch && lastEditedField === 'name' && <DuplicateHint place={hintMatch} onConfirm={confirmHint} onDismiss={hint.dismiss} />}

          <label className={classNames('field', { hasError: Boolean(streetError) })}>
            <span className="label">{consts.STREET_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(venue.street)}
              value={venue.street}
              onChange={(event) => {
                setLastEditedField('street');
                onChangeVenue({ ...venue, street: event.target.value });
              }}
            />
            <span className="helper">{consts.STREET_HELPER}</span>
            {streetError && <span className="error">{streetError}</span>}
          </label>
          {hintMatch && lastEditedField === 'street' && <DuplicateHint place={hintMatch} onConfirm={confirmHint} onDismiss={hint.dismiss} />}

          <label className="field">
            <span className="label">{consts.FLOOR_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(venue.floor)}
              value={venue.floor}
              onChange={(event) => onChangeVenue({ ...venue, floor: event.target.value })}
            />
          </label>
        </>
      )}
    </div>
  );
})`
  ${styles.PlacePicker}
`;
