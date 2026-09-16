import type { ReactNode } from 'react';

export interface ResponsiveSheetProps {
  className?: string;
  ariaLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}
