export const OPEN_VIEWER_LABEL = 'הצגת התמונה במסך מלא';

export const thumbnailLabel = (index: number): string => `תמונה ${index + 1}`;

// Every phone slide opens the same full viewer, so each needs its own
// accessible name rather than sharing `OPEN_VIEWER_LABEL` (the desktop
// frame's own single button, which never has this ambiguity since there is
// only ever one of it on screen).
export const openSlideViewerLabel = (index: number): string => `הצגת ${thumbnailLabel(index)} במסך מלא`;
