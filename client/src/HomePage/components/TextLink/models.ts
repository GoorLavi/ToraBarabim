import type { ReactNode } from 'react';

export interface TextLinkProps {
  className?: string;
  to: string;
  children: ReactNode;
  // Points at the inline end: this component only ever renders a link that
  // moves forward into more content ("see all"), never a back link.
  withChevron?: boolean;
}
