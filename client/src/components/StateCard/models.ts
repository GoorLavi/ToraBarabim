import type { ReactNode } from 'react';

interface StateCardActionBase {
  actionLabel: string;
  actionStyle: 'primary' | 'quiet';
}

// A navigation action renders as a link, a retry or a clear-filter renders
// as a button; never both on the same card (mirrors NotFoundScreenProps).
export type StateCardAction = StateCardActionBase & ({ actionTo: string } | { onAction: () => void });

export interface StateCardProps {
  className?: string;
  // 'surface': bordered, no tint, backs a transient error and a not-found
  // fact. 'empty': the ratified empty-state fill, no border
  // (00-shared-shell.md, "The state card").
  variant: 'surface' | 'empty';
  heading: ReactNode;
  body?: ReactNode;
  action?: StateCardAction;
}
