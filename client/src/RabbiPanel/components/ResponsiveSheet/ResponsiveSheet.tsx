import styled from 'styled-components';

import type { ResponsiveSheetProps } from './models';
import * as styles from './styles';

export const ResponsiveSheet = styled(({ className, ariaLabel, onDismiss, children }: ResponsiveSheetProps) => (
  <div className={className} role="presentation" onClick={onDismiss}>
    <div className="panel" role="dialog" aria-modal="true" aria-label={ariaLabel} onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  </div>
))`
  ${styles.ResponsiveSheet}
`;
