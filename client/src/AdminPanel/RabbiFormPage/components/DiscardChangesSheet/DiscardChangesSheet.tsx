import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import * as parentConsts from '~/AdminPanel/RabbiFormPage/consts';

import type { DiscardChangesSheetProps } from './models';
import * as styles from './styles';

// The edit-mode cancel confirm-sheet, same shape as
// `RabbiPanel/UpcomingPage`'s `CancelOccurrenceSheet`: `ResponsiveSheet`
// plus this component's own heading/body/actions, its copy borrowed from
// the parent page rather than a `consts.ts` of its own.
export const DiscardChangesSheet = styled(({ className, onDiscard, onDismiss }: DiscardChangesSheetProps) => (
  <ResponsiveSheet className={className} ariaLabel={parentConsts.DISCARD_CHANGES_HEADING} onDismiss={onDismiss}>
    <h2 className="heading">{parentConsts.DISCARD_CHANGES_HEADING}</h2>
    <p className="body">{parentConsts.DISCARD_CHANGES_BODY}</p>

    <div className="actions">
      <button type="button" className="confirm" onClick={onDiscard}>
        {parentConsts.DISCARD_CHANGES_CONFIRM_LABEL}
      </button>
      <button type="button" className="back" onClick={onDismiss}>
        {parentConsts.DISCARD_CHANGES_BACK_LABEL}
      </button>
    </div>
  </ResponsiveSheet>
))`
  ${styles.DiscardChangesSheet}
`;
