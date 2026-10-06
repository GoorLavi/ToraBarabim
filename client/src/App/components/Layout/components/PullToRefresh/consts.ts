// The distance the indicator must be pulled to (after resistance, so it is
// what the person sees, not how far the finger went) for a release to
// refresh. One constant: the helper, the indicator and the stories read it.
export const PULL_THRESHOLD_PX = 72;

// The indicator never travels further than this, however far the finger goes.
export const MAX_PULL_PX = 120;

// The share of finger travel that becomes indicator travel. Below 1 so the
// page feels like it resists.
export const PULL_RESISTANCE = 0.55;

// Finger travel before the gesture is classified as vertical or horizontal.
export const AXIS_LOCK_SLOP_PX = 10;

export const INDICATOR_SIZE_PX = 40;

export const SPRING_BACK_MS = 200;

// The custom properties the hook writes on the indicator and the styles read.
export const DISTANCE_PROPERTY = '--pull-distance';
export const PROGRESS_PROPERTY = '--pull-progress';

// The ring: a circle of this radius in a 24 by 24 view box.
export const RING_RADIUS = 10;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
export const RING_STROKE_WIDTH = 2.4;
// How far the arc turns over a full pull, so it seems to wind up as it is drawn.
export const PULL_ROTATION_DEG = 270;
export const SPIN_DURATION_MS = 900;
// While refreshing the arc is a fixed short stretch of the ring: this share is left undrawn.
export const REFRESHING_ARC_GAP_SHARE = 0.7;

export const PULL_READY_LABEL = 'שחררו כדי לרענן';
export const REFRESHING_LABEL = 'העמוד מתרענן';

// The disc arrives by moving, not by fading: it is fully opaque after a quarter of the threshold.
export const PULL_OPACITY_RAMP = 4;
