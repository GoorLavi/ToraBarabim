import styled from 'styled-components';

import * as parentConsts from '../../consts';
import type { DuplicateHintProps } from './models';
import * as styles from './styles';

// Barely insistent on purpose: `role='status'`, never `role='alert'`, never
// takes focus, never moves the save button, and shows exactly one match,
// never a list. Dismissing only closes the hint for the value that
// triggered it; it never saves anything on its own.
export const DuplicateHint = styled(({ className, place, onConfirm, onDismiss }: DuplicateHintProps) => (
  <div className={className} role="status">
    <p className="message">
      {parentConsts.DUPLICATE_HINT_PREFIX}
      <span dir="auto">{place.name}</span>
      {parentConsts.DUPLICATE_HINT_SUFFIX}
    </p>
    <div className="actions">
      <button type="button" className="confirm" onClick={onConfirm}>
        {parentConsts.DUPLICATE_HINT_CONFIRM_LABEL}
      </button>
      <button type="button" className="dismiss" onClick={onDismiss}>
        {parentConsts.DUPLICATE_HINT_DISMISS_LABEL}
      </button>
    </div>
  </div>
))`
  ${styles.DuplicateHint}
`;
