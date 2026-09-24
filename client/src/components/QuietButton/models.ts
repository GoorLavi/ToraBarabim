interface QuietButtonBaseProps {
  className?: string;
  label: string;
}

// A navigation action renders as a link, a retry, a clear-filter or a
// load-more renders as a button, and the button branch alone can disable
// itself while a request it started is in flight. The third branch, `href`,
// is an outbound anchor (`tel:`, `https://wa.me/...`), the only branch that
// ever needs `target`/`rel`, since a `tel:` link opens in place and a
// `wa.me` one wants a new tab.
export type QuietButtonProps = QuietButtonBaseProps &
  (
    | { to: string }
    | { onClick: () => void; disabled?: boolean }
    | { href: string; ariaLabel?: string; target?: string; rel?: string; onClick?: () => void }
  );
