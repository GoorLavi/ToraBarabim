import type { ReactNode } from 'react';

export interface FilterDrawerProps {
  className?: string;
  ariaLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}
