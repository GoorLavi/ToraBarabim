import type { LessonOccurrence } from '@torabarabim/common';

export interface LessonPageProps {
  className?: string;
  // The name, slug and preview limit arrive synchronously from the loader
  // (routes/lesson.server.ts); only `lessons` is deferred, never awaited
  // here: the ticket must never wait on this query (LOCKED PLAN, "The
  // preview is DEFERRED, not awaited"). Resolved inside AreaLessonsPreview's
  // own `Suspense` boundary.
  areaPreview: AreaPreview;
}

// Frozen contract with the loader (routes/lesson.server.ts). `areaName`,
// `areaSlug` and `limit` (the server's AREA_PREVIEW_LIMIT) are known before
// the preview query runs, so the section heading and its loading skeleton
// can paint immediately. `lessons` is the deferred part: `ready` with an
// empty `items` is the empty state (renders a StateCard); `unavailable`
// means the preview query itself failed and is a separate case, so the page
// never prints "no other lessons" when the truth is "we could not find out".
export interface AreaPreview {
  areaName: string;
  areaSlug: string;
  limit: number;
  lessons: Promise<AreaPreviewLessons>;
}

export type AreaPreviewLessons =
  | { kind: 'ready'; items: LessonOccurrence[] }
  | { kind: 'unavailable' };
