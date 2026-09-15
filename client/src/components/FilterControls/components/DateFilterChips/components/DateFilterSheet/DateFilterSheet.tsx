import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import type { DateFilterSheetProps } from './models';
import * as styles from './styles';

export const DateFilterSheet = styled(
  ({ className, heading, closeLabel, onClose, onDismiss, contentRef, children }: DateFilterSheetProps) => (
    <ResponsiveSheet className={className} {...{ ariaLabel: heading, onDismiss }}>
      <div className="content" ref={contentRef}>
        <div className="headingRow">
          <h2 className="heading">{heading}</h2>
          <button type="button" className="closeButton" aria-label={closeLabel} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </ResponsiveSheet>
  ),
)`
  ${styles.DateFilterSheet}
`;
