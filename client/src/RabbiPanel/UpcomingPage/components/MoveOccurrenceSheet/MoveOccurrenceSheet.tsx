import { useState } from 'react';
import styled from 'styled-components';

import { CitySelect } from '~/components/CitySelect/CitySelect';
import { directionForValue } from '~/helpers';
import { ResponsiveSheet } from '~/RabbiPanel/components/ResponsiveSheet/ResponsiveSheet';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import * as parentConsts from '~/RabbiPanel/UpcomingPage/consts';

import { buildMovePlace, initialMoveFormState, validateMoveForm } from './helpers';
import type { MoveFormErrors, MoveOccurrenceSheetProps } from './models';
import * as styles from './styles';
import { useMoveOccurrence } from './useMoveOccurrence';

export const MoveOccurrenceSheet = styled(({ className, occurrence, onDismiss }: MoveOccurrenceSheetProps) => {
  const move = useMoveOccurrence();
  const [form, setForm] = useState(() => initialMoveFormState(occurrence));
  const [fieldErrors, setFieldErrors] = useState<MoveFormErrors>({});

  const handleSubmit = (): void => {
    const errors = validateMoveForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    move.mutate(
      { lessonId: occurrence.lessonId, date: occurrence.date, startTime: form.startTime, place: buildMovePlace(form) },
      { onSuccess: onDismiss },
    );
  };

  return (
    <ResponsiveSheet className={className} ariaLabel={parentConsts.MOVE_SHEET_HEADING} onDismiss={onDismiss}>
      <h2 className="heading">{parentConsts.MOVE_SHEET_HEADING}</h2>

      <div className="form">
        <label className="field">
          <span className="label">{parentConsts.MOVE_START_TIME_LABEL}</span>
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
          />
          {fieldErrors.startTime && <span className="error">{fieldErrors.startTime}</span>}
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={form.placeOverrideEnabled}
            onChange={(event) => setForm((prev) => ({ ...prev, placeOverrideEnabled: event.target.checked }))}
          />
          <span>{parentConsts.MOVE_PLACE_TOGGLE}</span>
        </label>

        {form.placeOverrideEnabled && (
          <div className="placeFields">
            <div className="field">
              <span className="label">{parentConsts.MOVE_CITY_LABEL}</span>
              <CitySelect
                city={form.city}
                onSelectCity={(city) => setForm((prev) => ({ ...prev, city }))}
                placeholderLabel={parentConsts.MOVE_CITY_PLACEHOLDER}
              />
              {fieldErrors.city && <span className="error">{fieldErrors.city}</span>}
            </div>

            <label className="field">
              <span className="label">{parentConsts.MOVE_PLACE_NAME_LABEL}</span>
              <input
                type="text"
                dir={directionForValue(form.placeName)}
                value={form.placeName}
                onChange={(event) => setForm((prev) => ({ ...prev, placeName: event.target.value }))}
              />
              {fieldErrors.placeName && <span className="error">{fieldErrors.placeName}</span>}
            </label>

            <label className="field">
              <span className="label">{parentConsts.MOVE_STREET_LABEL}</span>
              <input
                type="text"
                dir={directionForValue(form.street)}
                value={form.street}
                onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
              />
              {fieldErrors.street && <span className="error">{fieldErrors.street}</span>}
            </label>
          </div>
        )}

        <p className="scopeNote">{parentConsts.MOVE_SCOPE_NOTE}</p>

        {move.isError && (
          <p className="error" role="alert">
            {rabbiErrorMessage(move.error)}
          </p>
        )}
      </div>

      <div className="actions">
        <button type="button" className="save" disabled={move.isPending} onClick={handleSubmit}>
          {move.isPending ? parentConsts.MOVE_SAVING_LABEL : parentConsts.MOVE_SAVE_LABEL}
        </button>
        <button type="button" className="back" disabled={move.isPending} onClick={onDismiss}>
          {parentConsts.MOVE_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.MoveOccurrenceSheet}
`;
