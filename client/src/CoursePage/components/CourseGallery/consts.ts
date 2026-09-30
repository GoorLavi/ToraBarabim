export const OPEN_VIEWER_LABEL = 'הצגת התמונה במסך מלא';

// How long the visible-slide tracker waits after the last scroll movement
// before trusting intersection again (useVisibleSlideIndex.ts), the same
// settle window `Rail/useRailScrollTracking.ts` already waits out for its
// own, unrelated scroll-burst concern.
export const SCROLL_SETTLE_MS = 200;

export const thumbnailLabel = (index: number): string => `תמונה ${index + 1}`;

// Every phone slide opens the same full viewer, so each needs its own
// accessible name rather than sharing `OPEN_VIEWER_LABEL` (the desktop
// frame's own single button, which never has this ambiguity since there is
// only ever one of it on screen).
export const openSlideViewerLabel = (index: number): string => `הצגת ${thumbnailLabel(index)} במסך מלא`;
