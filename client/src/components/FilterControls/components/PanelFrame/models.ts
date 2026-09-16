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
  children: ReactNode;
}
