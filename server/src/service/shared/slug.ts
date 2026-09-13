// Turns a Hebrew display name into a stable URL segment. The same name
// always normalises to the same slug, and every lookup by slug is an exact
// match against this output, never a fuzzy match back to the display name.
export const toSlug = (name: string): string =>
  name
    .normalize('NFKD')
    // Niqqud and other combining marks decompose onto their base letter
    // above; dropping the `Mn` category collapses a vocalised and an
    // unvocalised spelling of the same name to one slug.
    .replace(/\p{Mn}/gu, '')
    // Geresh and gershayim, in their dedicated Hebrew code points
    // (U+05F3, U+05F4) and in the ASCII quote characters most keyboards
    // substitute for them, mark an abbreviation rather than a word break
    // (e.g. ת״א). They are dropped outright rather than turned into a
    // separator, so the letters they sit between stay adjacent.
    .replace(/[׳״'"`]/g, '')
    .toLowerCase()
    // Everything else that is not a letter or a digit, including spaces,
    // punctuation, and any run of them, is a word break.
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
