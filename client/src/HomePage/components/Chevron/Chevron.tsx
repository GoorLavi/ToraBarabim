// The inline-end arrow every "see more" link on the home page ends with:
// `TextLink`, `WomensAreaTile`'s own "see all" line, and `DedicationBand`'s
// invitation line. Each caller sizes and colours it through its own
// `> .chevron` selector; this draws the one glyph, with no difference
// between callers to pass in.
export const Chevron = () => (
  <svg className="chevron" viewBox="0 0 7 12" fill="none" aria-hidden="true">
    <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
