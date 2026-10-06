import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import { CALENDAR_ICON_PATH } from '../../consts';
import type { CalendarChoice } from '../../models';
import { GoogleCalendarMark } from './components/GoogleCalendarMark/GoogleCalendarMark';
import * as consts from './consts';
import type { CalendarSheetProps } from './models';
import * as styles from './styles';

const CALENDAR_CHOICES: CalendarChoice[] = ['google', 'device'];

// Two questions in one sheet. First which calendar the person uses, then (a
// recurring lesson only) one date or all of them. Which link each answer
// opens is the caller's: this sheet only asks.
export const CalendarSheet = styled(({ className, dateLabel, step, onChooseCalendar, onAddOneEvent, onSubscribe, onBack, onDismiss }: CalendarSheetProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step.step);

  // The row that was tapped is gone once the step changes, which would drop
  // focus onto the page behind the dialog, outside its Tab trap. The heading
  // takes it instead and a screen reader reads the new step from the top.
  useEffect(() => {
    if (shownStep.current === step.step) return;
    shownStep.current = step.step;
    headingRef.current?.focus();
  }, [step.step]);

  const chosen = step.step === 'scope' && step.canGoBack ? consts.CALENDAR_CHOICE_COPY[step.calendar] : null;

  return (
    <ResponsiveSheet {...{ className, ariaLabel: consts.SHEET_TITLE, onDismiss }}>
      <div className="headingRow">
        {chosen && (
          <button type="button" className="roundButton backButton" aria-label={consts.BACK_LABEL} onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d={consts.BACK_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <h2 className="heading" tabIndex={-1} ref={headingRef}>
          {consts.SHEET_TITLE}
        </h2>
        <button type="button" className="roundButton closeButton" aria-label={consts.CLOSE_LABEL} onClick={onDismiss}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={consts.CLOSE_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {step.step === 'calendar' && (
        <>
          <p className="question">{consts.CALENDAR_QUESTION}</p>

          {CALENDAR_CHOICES.map((calendar) => (
            <button key={calendar} type="button" className={classNames('choice', calendar)} onClick={() => onChooseCalendar(calendar)}>
              {calendar === 'google' ? (
                <span className="choiceMark">
                  <GoogleCalendarMark />
                </span>
              ) : (
                <span className="choiceIcon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d={CALENDAR_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span className="choiceText">
                <span className="choiceTitle">{consts.CALENDAR_CHOICE_COPY[calendar].title}</span>
                <span className="choiceLine">{consts.CALENDAR_CHOICE_COPY[calendar].line}</span>
              </span>
            </button>
          ))}
        </>
      )}

      {step.step === 'scope' && (
        <>
          {chosen && (
            <p className="chosenCalendar">
              {step.calendar === 'google' && <GoogleCalendarMark />}
              <span>{chosen.title}</span>
            </p>
          )}

          <button type="button" className="choice addOne" onClick={onAddOneEvent}>
            <span className="choiceIcon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={CALENDAR_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="choiceText">
              <span className="choiceTitle">{consts.ADD_ONE_TITLE}</span>
              <span className="choiceLine">{dateLabel}</span>
            </span>
          </button>

          <button type="button" className="choice subscribe" onClick={onSubscribe}>
            <span className="choiceIcon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={consts.SUBSCRIBE_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="choiceText">
              <span className="choiceTitle">{consts.SUBSCRIBE_TITLE}</span>
              <span className="choiceLine">{consts.SUBSCRIBE_LINE}</span>
            </span>
          </button>
        </>
      )}
    </ResponsiveSheet>
  );
})`
  ${styles.CalendarSheet}
`;
