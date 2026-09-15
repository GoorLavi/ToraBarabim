import { createPortal } from 'react-dom';
import styled from 'styled-components';

import type { ResponsiveSheetProps } from './models';
import * as styles from './styles';

// Portalled into `document.body`. `PinnedHeaderBar` carries `transform:
// translateY(...)` in both its states, and a transformed ancestor becomes
// the containing block for a `position: fixed` descendant: without the
// portal, a sheet opened from inside that bar (FilterFieldsGrid renders
// there below `lg`) would cover only the bar's own box instead of the
// viewport. `document` does not exist during server rendering, but this
// component only ever renders after an interaction, so it is never part of
// the server output; the guard below makes that true by construction rather
// than by luck. The portal moves only the DOM node, not the React tree, so
// the styled-components theme context (and any other context) still reaches
// `.panel` and its children normally.
export const ResponsiveSheet = styled(({ className, ariaLabel, onDismiss, children }: ResponsiveSheetProps) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={className} role="presentation" onClick={onDismiss}>
      <div className="panel" role="dialog" aria-modal="true" aria-label={ariaLabel} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
})`
  ${styles.ResponsiveSheet}
`;
