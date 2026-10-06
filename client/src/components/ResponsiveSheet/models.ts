import type { ReactNode } from 'react';

export interface ResponsiveSheetProps {
  className?: string;
  ariaLabel: string;
  onDismiss: () => void;
  // A card that sits over the page without taking it over: no scrim, no
  // focus move or trap, no `aria-modal`, `role="region"`. Escape and the
  // caller's own buttons dismiss it; a tap outside does not. From `md` up it
  // anchors to the inline-end corner at 400px instead of centring.
  isNonModal?: boolean;
  children: ReactNode;
}
