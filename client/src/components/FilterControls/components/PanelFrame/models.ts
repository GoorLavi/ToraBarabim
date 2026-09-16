import type { ReactNode, RefObject } from 'react';

export interface PanelFrameProps {
  className?: string;
  isDrawer: boolean;
  isWide: boolean;
  heading: string;
  closeLabel: string;
  onClose: () => void;
  // Focused instead of the panel itself when `isWide` and provided (e.g.
  // CityPickerPanel's own search field); omitted, the panel focuses itself.
  initialFocusRef?: RefObject<HTMLInputElement | null>;
  // Rendered between the heading row and the hairline, still part of the
  // fixed (non-scrolling) region: CityPickerPanel's search field lives here
  // so it keeps its place in front of the list. Omitted when a caller has
  // no fixed content of its own.
  fixedContent?: ReactNode;
  children: ReactNode;
}
