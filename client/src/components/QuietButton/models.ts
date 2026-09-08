interface QuietButtonBaseProps {
  className?: string;
  label: string;
}

// A navigation action renders as a link, a retry, a clear-filter or a
// load-more renders as a button, and the button branch alone can disable
// itself while a request it started is in flight.
export type QuietButtonProps = QuietButtonBaseProps & ({ to: string } | { onClick: () => void; disabled?: boolean });
