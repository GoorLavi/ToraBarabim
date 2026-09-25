import * as consts from './consts';
import type { CropRect, CropTransform, ImageDimensions, PhotoPickerAspectRatio } from './models';

// Draws `rect` from `image` onto a canvas, scaled down to `maxLongSide` on
// its own long side when larger, never up, and exports it as a JPEG: the
// one encoder both the crop step's own confirmed crop rect and the
// picker's non-crop path (the full source rect, no crop) go through, so a
// phone photo neither one ever ships at full source resolution.
export const exportImage = (image: HTMLImageElement, rect: CropRect, maxLongSide: number): Promise<File> => {
  const longSide = Math.max(rect.width, rect.height);
  const scale = Math.min(1, maxLongSide / longSide);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('canvas 2d context unavailable for photo export'));
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('exported canvas produced no blob'));
          return;
        }
        resolve(new File([blob], consts.EXPORTED_PHOTO_FILE_NAME, { type: consts.CROP_OUTPUT_TYPE }));
      },
      consts.CROP_OUTPUT_TYPE,
      consts.CROP_OUTPUT_QUALITY,
    );
  });
};

// The largest rectangle at `aspectRatio` that fits inside a source image:
// the crop someone gets at zoom 1, before they zoom in at all. Anchored so
// whichever axis has slack (the one the ratio does not already consume) is
// the one a person can pan across.
export const maxCropForSource = (source: ImageDimensions, aspectRatio: number): ImageDimensions => {
  if (source.width / source.height >= aspectRatio) {
    return { width: source.height * aspectRatio, height: source.height };
  }
  return { width: source.width, height: source.width / aspectRatio };
};

// Whether a source image can yield a crop that clears the floor at all: the
// pre-check the picker runs before ever opening the crop step.
export const canCropToFloor = (source: ImageDimensions, aspectRatio: number, minWidth: number, minHeight: number): boolean => {
  const max = maxCropForSource(source, aspectRatio);
  return max.width >= minWidth && max.height >= minHeight;
};

// The scale at which the source image, drawn at its natural size, just
// covers a viewport of the given size on both axes: zoom 1, the most
// zoomed-out the crop step allows (any less would show a gap on one axis).
export const coverScale = (source: ImageDimensions, viewport: ImageDimensions): number => Math.max(viewport.width / source.width, viewport.height / source.height);

// The zoom, relative to `coverScale`, beyond which the crop rectangle's own
// source pixels would drop below the floor's width. The viewport is always
// at the caller's own ratio (the crop step's own frame), so this bound is
// the same whether it is derived from the viewport's width or its height.
export const maxZoom = (source: ImageDimensions, viewport: ImageDimensions, minWidth: number): number => {
  const visibleSourceWidthAtZoom1 = viewport.width / coverScale(source, viewport);
  return visibleSourceWidthAtZoom1 / minWidth;
};

// Pulls an offset back to whichever edge would otherwise open a gap, so the
// displayed image always covers the viewport on that axis.
export const clampOffset = (offset: number, viewportSize: number, displaySize: number): number => Math.min(0, Math.max(viewportSize - displaySize, offset));

// Clamps a transform's zoom to [1, maxZoom] and its offsets to whatever that
// zoom now allows, in that order: an offset valid at the old zoom can open a
// gap at the new one.
export const clampTransform = (transform: CropTransform, source: ImageDimensions, viewport: ImageDimensions, minWidth: number): CropTransform => {
  const zoom = Math.min(Math.max(transform.zoom, 1), maxZoom(source, viewport, minWidth));
  const scale = coverScale(source, viewport) * zoom;
  return {
    zoom,
    offsetX: clampOffset(transform.offsetX, viewport.width, source.width * scale),
    offsetY: clampOffset(transform.offsetY, viewport.height, source.height * scale),
  };
};

// The transform that centers the source image in the viewport at zoom 1:
// the widest crop the floor allows, framed by default.
export const initialTransform = (source: ImageDimensions, viewport: ImageDimensions): CropTransform => {
  const scale = coverScale(source, viewport);
  return {
    zoom: 1,
    offsetX: (viewport.width - source.width * scale) / 2,
    offsetY: (viewport.height - source.height * scale) / 2,
  };
};

// Changes zoom while keeping the source pixel under `point` (a pinch
// midpoint, or a pointer position under a wheel event) in the same place in
// the viewport, rather than letting the image jump to recenter on the
// viewport itself.
export const zoomAroundPoint = (
  transform: CropTransform,
  point: { x: number; y: number },
  nextZoom: number,
  source: ImageDimensions,
  viewport: ImageDimensions,
  minWidth: number,
): CropTransform => {
  const scale = coverScale(source, viewport);
  const previousScale = scale * transform.zoom;
  const clampedZoom = Math.min(Math.max(nextZoom, 1), maxZoom(source, viewport, minWidth));
  const ratio = (scale * clampedZoom) / previousScale;
  return clampTransform(
    {
      zoom: clampedZoom,
      offsetX: point.x - (point.x - transform.offsetX) * ratio,
      offsetY: point.y - (point.y - transform.offsetY) * ratio,
    },
    source,
    viewport,
    minWidth,
  );
};

// The region of the source image, in the source's own pixel space, that the
// viewport currently shows: what the crop step draws into the output canvas
// on confirm.
export const sourceCropRect = (transform: CropTransform, source: ImageDimensions, viewport: ImageDimensions): CropRect => {
  const scale = coverScale(source, viewport) * transform.zoom;
  return {
    x: -transform.offsetX / scale,
    y: -transform.offsetY / scale,
    width: viewport.width / scale,
    height: viewport.height / scale,
  };
};

export const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

// Dimensions read as "900 על 1200", never "900x1200": a multiplication sign
// between two numbers is bidi-neutral, inherits the paragraph's direction,
// and renders the pair reversed to anyone reading it as a Latin unit.
// '16:9' gets an extra sentence: it is the one ratio that opens the crop
// step below, so its own help line says so instead of just stating a floor.
// Copy approved by `tora-hebrew-editor`.
export const photoHelpSize = (aspectRatio: PhotoPickerAspectRatio, minWidth: number, minHeight: number): string => {
  const floor = `לפחות ${minWidth} על ${minHeight} פיקסלים`;
  if (aspectRatio === '16:9') return `${floor}. אחרי הבחירה אפשר לסמן איזה חלק מהתמונה יופיע באתר.`;
  return floor;
};

// Shown by the picker itself, in place of the normal help list, when a just
// picked file cannot yield a crop at the floor a caller passed in ('16:9'
// only: the crop step needs to know it can produce a crop at the floor
// before it ever opens). Copy approved by `tora-hebrew-editor`.
export const photoTooSmallError = (minWidth: number, minHeight: number): string => `התמונה קטנה מדי. צריך תמונה בגודל ${minWidth} על ${minHeight} פיקסלים לפחות.`;

export const aspectRatioValue = (aspectRatio: PhotoPickerAspectRatio): number => consts.ASPECT_RATIO_VALUE[aspectRatio];
