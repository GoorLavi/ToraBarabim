import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import * as consts from './consts';
import type { CalendarSheetProps } from './models';
import * as styles from './styles';

// The two ways to put a recurring lesson in a calendar. Which link each one
// opens is the caller's: this sheet only asks.
export const CalendarSheet = styled(({ className, dateLabel, onAddOneEvent, onSubscribe, onDismiss }: CalendarSheetProps) => (
  <ResponsiveSheet {...{ className, ariaLabel: consts.SHEET_TITLE, onDismiss }}>
    <h2 className="heading">{consts.SHEET_TITLE}</h2>

    <button type="button" className="choice addOne" onClick={onAddOneEvent}>
      <span className="choiceTitle">{consts.ADD_ONE_TITLE}</span>
      <span className="choiceLine">{dateLabel}</span>
    </button>

    <button type="button" className="choice subscribe" onClick={onSubscribe}>
      <span className="choiceTitle">{consts.SUBSCRIBE_TITLE}</span>
      <span className="choiceLine">{consts.SUBSCRIBE_LINE}</span>
    </button>

    <button type="button" className="close" onClick={onDismiss}>
      {consts.CLOSE_LABEL}
    </button>
  </ResponsiveSheet>
))`
  ${styles.CalendarSheet}
`;
