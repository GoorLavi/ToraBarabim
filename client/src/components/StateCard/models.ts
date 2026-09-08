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
  // 'h1' when this card is the page's only heading (a route or a record
  // that never resolved, with no other heading rendered on screen). 'h2'
  // when it sits under a heading the page already rendered.
  headingLevel: 'h1' | 'h2';
  heading: ReactNode;
  body?: ReactNode;
  action?: StateCardAction;
}
