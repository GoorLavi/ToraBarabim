import type { ReactNode } from 'react';

interface PrimaryButtonBaseProps {
  className?: string;
  label: string;
  icon?: ReactNode;
}

// A navigation action renders as a link, a retry or an in-place action
// renders as a button; never both on the same call (matches the
// NotFoundScreen and StateCard action shape).
export type PrimaryButtonProps = PrimaryButtonBaseProps & ({ to: string } | { onClick: () => void });
