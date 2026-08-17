import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';

import type { RecurrenceFieldsProps } from './models';
import * as styles from './styles';

export const RecurrenceFields = styled(
  ({
    className,
    recurrenceKind,
    onSelectRecurrenceKind,
    weekdays,
    onToggleWeekday,
    date,
    onChangeDate,
    startTime,
    onChangeStartTime,
    durationMinutes,
    onChangeDurationMinutes,
    recurrenceErrorMessage,
    startTimeErrorMessage,
    durationErrorMessage,
  }: RecurrenceFieldsProps) => (
    <div className={className}>
      <div className="kindToggle" role="radiogroup">
        <button
          type="button"
          className={classNames('kindOption', { selected: recurrenceKind === 'weekly' })}
          role="radio"
          aria-checked={recurrenceKind === 'weekly'}
          onClick={() => onSelectRecurrenceKind('weekly')}
        >
          {parentConsts.RECURRING_OPTION_LABEL}
        </button>
        <button
          type="button"
          className={classNames('kindOption', { selected: recurrenceKind === 'once' })}
          role="radio"
          aria-checked={recurrenceKind === 'once'}
          onClick={() => onSelectRecurrenceKind('once')}
        >
          {parentConsts.ONE_TIME_OPTION_LABEL}
        </button>
      </div>

      {recurrenceKind === 'weekly' ? (
        <div className="weekdays" role="group" aria-label={parentConsts.WEEKDAYS_LABEL}>
          {parentConsts.WEEKDAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={classNames('weekday', { selected: weekdays.includes(option.value) })}
              aria-pressed={weekdays.includes(option.value)}
              onClick={() => onToggleWeekday(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <label className="field">
          <span className="label">{parentConsts.DATE_LABEL}</span>
          <input type="date" value={date} onChange={(event) => onChangeDate(event.target.value)} />
        </label>
      )}

      {recurrenceErrorMessage && <p className="error">{recurrenceErrorMessage}</p>}

      <div className="row">
        <label className="field">
          <span className="label">{parentConsts.START_TIME_LABEL}</span>
          <input type="time" value={startTime} onChange={(event) => onChangeStartTime(event.target.value)} />
          {startTimeErrorMessage && <span className="error">{startTimeErrorMessage}</span>}
        </label>

        <label className="field">
          <span className="label">{parentConsts.DURATION_LABEL}</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={durationMinutes}
            onChange={(event) => onChangeDurationMinutes(event.target.value)}
          />
          {durationErrorMessage && <span className="error">{durationErrorMessage}</span>}
        </label>
      </div>
    </div>
  ),
)`
  ${styles.RecurrenceFields}
`;
