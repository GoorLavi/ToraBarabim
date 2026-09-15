import type { ReactNode } from 'react';

export interface CityPickerDrawerProps {
  className?: string;
  ariaLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}
