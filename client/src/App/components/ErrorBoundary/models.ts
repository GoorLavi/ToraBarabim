import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
  className?: string;
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}
