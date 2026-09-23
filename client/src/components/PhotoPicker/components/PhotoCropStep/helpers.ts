import * as parentHelpers from '../../helpers';
import type { ImageDimensions } from '../../models';
import * as consts from './consts';

// A rounding slack for the floating-point comparisons below: both values are
// themselves the product of a ratio multiplication, so an exact `0` is not
// reliable.
const FRAMING_SLACK_EPSILON_PX = 0.5;

// The largest 16:9 box that fits inside the stage's measured content area,
// capped so the frame never grows past its historical desktop width. Bound
// by both axes, not width alone: deriving the frame from width only let it
// stand taller than the stage actually had room for, overlapping the hint
// below it (design gate finding, "two smaller things the reviewer
// measured").
export const windowSizeForStage = (stage: ImageDimensions): ImageDimensions => {
  const cappedWidth = Math.min(stage.width, consts.CROP_WINDOW_MAX_WIDTH_PX);
  const widthBoundHeight = cappedWidth / parentHelpers.CROP_ASPECT_RATIO;
  if (widthBoundHeight <= stage.height) return { width: cappedWidth, height: widthBoundHeight };
  return { width: stage.height * parentHelpers.CROP_ASPECT_RATIO, height: stage.height };
};

// Whether the source can be neither panned nor zoomed inside the window: the
// widest crop it can give is already the only crop it can give (design gate
// finding F6, the `PhotoAtExactFloor` story). Drag and pinch both do nothing
// in this state, so the hint line has to say something else.
export const hasNoFramingRoom = (source: ImageDimensions, cropWindow: ImageDimensions): boolean => {
  if (parentHelpers.maxZoom(source, cropWindow) > 1) return false;
  const scale = parentHelpers.coverScale(source, cropWindow);
  return source.width * scale <= cropWindow.width + FRAMING_SLACK_EPSILON_PX && source.height * scale <= cropWindow.height + FRAMING_SLACK_EPSILON_PX;
};
