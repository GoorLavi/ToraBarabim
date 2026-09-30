// Clamped, not wrapped: the arrows go disabled at the ends instead
// (design brief A, item 7, "disabled at the ends... never hidden"), the
// same convention `Rail` uses.
export const clampedIndex = (index: number, length: number): number => Math.min(Math.max(index, 0), length - 1);
