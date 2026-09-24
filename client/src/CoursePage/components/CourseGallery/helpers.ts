// Wraps rather than clamps: the last photo's "next" returns to the first,
// matching a swipeable strip's own behaviour, and never leaves the arrow
// disabled at either end (unlike `Rail`, which is a browsing list, not a
// fixed, small set of a single course's own photos).
export const wrappedIndex = (index: number, length: number): number => ((index % length) + length) % length;
