import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import { CALENDAR_ICON_PATH } from '../../consts';
import * as consts from './consts';
import type { CalendarSheetProps } from './models';
import * as styles from './styles';

// The two ways to put a recurring lesson in a calendar. Which link each one
// opens is the caller's: this sheet only asks.
export const CalendarSheet = styled(({ className, dateLabel, onAddOneEvent, onSubscribe, onDismiss }: CalendarSheetProps) => (
  <ResponsiveSheet {...{ className, ariaLabel: consts.SHEET_TITLE, onDismiss }}>
    <div className="headingRow">
      <h2 className="heading">{consts.SHEET_TITLE}</h2>
      <button type="button" className="closeButton" aria-label={consts.CLOSE_LABEL} onClick={onDismiss}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d={consts.CLOSE_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>

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
  </ResponsiveSheet>
))`
  ${styles.CalendarSheet}
`;
