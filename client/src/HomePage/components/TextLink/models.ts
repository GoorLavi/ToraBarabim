import type { ReactNode } from 'react';

interface TextLinkBaseProps {
  className?: string;
  children: ReactNode;
  // Leads the label, for a link that carries a glyph of its own.
  icon?: ReactNode;
}

// A link goes somewhere (`to`); a button does something in place (an
// `onClick` and no `to`). They share one look, so the footer's install
// action is the same shape as the links beside it.
export type TextLinkProps = TextLinkBaseProps &
  (
    | {
        to: string;
        // Points at the inline end: this component only ever renders a link that
        // moves forward into more content ("see all"), never a back link.
        withChevron?: boolean;
        onClick?: () => void;
      }
    | { onClick: () => void; to?: undefined; withChevron?: undefined }
  );
