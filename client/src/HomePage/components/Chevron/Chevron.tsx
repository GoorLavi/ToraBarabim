// The inline-end arrow a "see more" line ends with. Each caller sizes and
// colours it through its own `> .chevron` selector.
export const Chevron = () => (
  <svg className="chevron" viewBox="0 0 7 12" fill="none" aria-hidden="true">
    <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
