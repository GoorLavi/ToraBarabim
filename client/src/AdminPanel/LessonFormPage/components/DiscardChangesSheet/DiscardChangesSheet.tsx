import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import * as consts from './consts';
import type { DiscardChangesSheetProps } from './models';
import * as styles from './styles';

// Confirms leaving the edit form once it has diverged from what was
// loaded. A local copy of the RabbiFormPage cancel-confirm sheet built in
// parallel this round (see this slice's report): lifting the two into one
// shared sheet is a follow-up once both have landed.
export const DiscardChangesSheet = styled(({ className, onConfirm, onDismiss }: DiscardChangesSheetProps) => (
  <ResponsiveSheet className={className} ariaLabel={consts.HEADING} onDismiss={onDismiss}>
    <h2 className="heading">{consts.HEADING}</h2>
    <p className="body">{consts.BODY}</p>

    <div className="actions">
      <button type="button" className="confirm" onClick={onConfirm}>
        {consts.CONFIRM_LABEL}
      </button>
      <button type="button" className="back" onClick={onDismiss}>
        {consts.BACK_LABEL}
      </button>
    </div>
  </ResponsiveSheet>
))`
  ${styles.DiscardChangesSheet}
`;
