import { useState } from 'react';
import styled from 'styled-components';

import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';
import { useMoveOccurrenceException } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/useMoveOccurrenceException';
import { FLOOR_LABEL } from '~/AdminPanel/LessonViewPage/consts';
import { CitySelect } from '~/components/CitySelect/CitySelect';
import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import { buildMovePlace, initialMoveFormState, validateMoveForm } from './helpers';
import type { MoveExceptionSheetProps, MoveFormErrors } from './models';
import * as styles from './styles';

export const MoveExceptionSheet = styled(({ className, lessonId, row, onDismiss }: MoveExceptionSheetProps) => {
  const move = useMoveOccurrenceException();
  const [form, setForm] = useState(() => initialMoveFormState(row));
  const [fieldErrors, setFieldErrors] = useState<MoveFormErrors>({});

  const handleSubmit = (): void => {
    const errors = validateMoveForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    move.mutate(
      {
        lessonId,
        date: row.date,
        existingExceptionId: row.existingException?.id,
        startTime: form.startTime,
        place: buildMovePlace(form),
        // Neither has a control on this sheet, so both are carried through
        // unchanged from what the occurrence already resolved, rather than
        // dropped by the full-replacement write the server does.
        substituteRabbiId: row.substituteRabbi?.id,
        note: row.note,
      },
      { onSuccess: onDismiss },
    );
  };

  return (
    <ResponsiveSheet className={className} {...{ ariaLabel: parentConsts.MOVE_SHEET_HEADING, onDismiss }}>
      <h2 className="heading">{parentConsts.MOVE_SHEET_HEADING}</h2>

      <div className="form">
        <label className="field">
          <span className="label">{parentConsts.MOVE_START_TIME_LABEL}</span>
          <input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} />
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
                fullWidth
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

            <label className="field">
              <span className="label">{FLOOR_LABEL}</span>
              <input
                type="text"
                dir={directionForValue(form.floor)}
                value={form.floor}
                onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))}
              />
            </label>
          </div>
        )}

        {/* Read only: this sheet edits the time and place, and has no
            control for either, but an admin editing a date should never
            have to guess whether something else is already attached to
            it. */}
        {(row.substituteRabbi || row.note) && (
          <div className="readOnlyFields">
            {row.substituteRabbi && <RecordField label={parentConsts.SUBSTITUTE_RABBI_LABEL} value={rabbiDisplayName(row.substituteRabbi)} />}
            {row.note && <RecordField label={parentConsts.NOTE_LABEL} value={row.note} />}
          </div>
        )}

        <p className="scopeNote">{parentConsts.MOVE_SCOPE_NOTE}</p>

        {move.isError && (
          <p className="error" role="alert">
            {adminErrorMessage(move.error)}
          </p>
        )}
      </div>

      <div className="actions">
        <button type="button" className="save" disabled={move.isPending} aria-busy={move.isPending} onClick={handleSubmit}>
          {move.isPending ? parentConsts.MOVE_SAVING_LABEL : parentConsts.MOVE_SAVE_LABEL}
        </button>
        <button type="button" className="back" disabled={move.isPending} onClick={onDismiss}>
          {parentConsts.MOVE_BACK_LABEL}
        </button>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.MoveExceptionSheet}
`;
