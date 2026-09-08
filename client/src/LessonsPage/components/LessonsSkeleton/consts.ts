// Three rows of two on a phone (05-lessons.md, "Phone, loading"); the same
// count reads fine as one full row plus a partial one on a wider grid
// (design-system.md: "A day group holding fewer lessons than the row has
// columns leaves an empty cell at the end... accepted, not a defect").
const SKELETON_CARD_COUNT = 6;

// Stable keys for a fixed-length placeholder list with no real data to key
// by (mirrors HomePage/components/LessonsSection/components/DayLessonsSkeleton/consts.ts).
export const SKELETON_CARD_KEYS = Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => `skeleton-card-${index}`);
