export type PullStatus = 'idle' | 'pulling' | 'ready' | 'refreshing';

export type GestureAxis = 'vertical' | 'horizontal';

export interface PullToRefreshProps {
  className?: string;
  // What a release past the threshold does. A prop only because a story
  // cannot stub `window.location.reload` (the browser forbids it); the app
  // never passes it and gets a full reload.
  onRefresh?: () => void;
}

export interface UsePullToRefreshOptions {
  isActive: boolean;
  onRefresh: () => void;
}

// A gesture is one of three things, never a bag of optional fields: not
// started (or abandoned), started but not yet classified, or a locked pull.
export type PullGesture =
  | { phase: 'none' }
  | { phase: 'undecided'; startX: number; startY: number }
  | { phase: 'pulling'; startY: number; distance: number };
