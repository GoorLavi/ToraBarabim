import * as consts from './consts';
import type { CropRect, CropTransform, ImageDimensions } from './models';

// 16 / 9 as a ratio rather than a literal, so every formula below (and the
// crop step's own viewport measurement, which needs the same ratio to turn
// a measured width into a height) reads as "the crop's own ratio" rather
// than repeating two numbers. The CSS `aspect-ratio: 16 / 9` on the crop
// step's own viewport box (styles.ts) is the one place that still writes
// the two numbers directly: a CSS rule cannot import a TypeScript constant.
export const CROP_ASPECT_RATIO = 16 / 9;

// The largest 16:9 rectangle that fits inside a source image: the crop
// someone gets at zoom 1, before they zoom in at all. Anchored so whichever
// axis has slack (the one the ratio does not already consume) is the one a
// person can pan across.
export const maxCropForSource = (source: ImageDimensions): ImageDimensions => {
  if (source.width / source.height >= CROP_ASPECT_RATIO) {
    return { width: source.height * CROP_ASPECT_RATIO, height: source.height };
  }
  return { width: source.width, height: source.width / CROP_ASPECT_RATIO };
};

// Whether a source image can yield a crop that clears the floor at all: the
// pre-check the picker runs before ever opening the crop step.
export const canCropToFloor = (source: ImageDimensions): boolean => {
  const max = maxCropForSource(source);
  return max.width >= consts.PLACE_PHOTO_MIN_WIDTH && max.height >= consts.PLACE_PHOTO_MIN_HEIGHT;
};

// The scale at which the source image, drawn at its natural size, just
// covers a viewport of the given size on both axes: zoom 1, the most
// zoomed-out the crop step allows (any less would show a gap on one axis).
export const coverScale = (source: ImageDimensions, viewport: ImageDimensions): number => Math.max(viewport.width / source.width, viewport.height / source.height);

// The zoom, relative to `coverScale`, beyond which the crop rectangle's own
// source pixels would drop below the floor. The viewport is always 16:9
// itself (the crop step's own frame), so this bound is the same whether it
// is derived from the viewport's width or its height.
export const maxZoom = (source: ImageDimensions, viewport: ImageDimensions): number => {
  const visibleSourceWidthAtZoom1 = viewport.width / coverScale(source, viewport);
  return visibleSourceWidthAtZoom1 / consts.PLACE_PHOTO_MIN_WIDTH;
};

// Pulls an offset back to whichever edge would otherwise open a gap, so the
// displayed image always covers the viewport on that axis.
export const clampOffset = (offset: number, viewportSize: number, displaySize: number): number => Math.min(0, Math.max(viewportSize - displaySize, offset));

// Clamps a transform's zoom to [1, maxZoom] and its offsets to whatever that
// zoom now allows, in that order: an offset valid at the old zoom can open a
// gap at the new one.
export const clampTransform = (transform: CropTransform, source: ImageDimensions, viewport: ImageDimensions): CropTransform => {
  const zoom = Math.min(Math.max(transform.zoom, 1), maxZoom(source, viewport));
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
export const zoomAroundPoint = (transform: CropTransform, point: { x: number; y: number }, nextZoom: number, source: ImageDimensions, viewport: ImageDimensions): CropTransform => {
  const scale = coverScale(source, viewport);
  const previousScale = scale * transform.zoom;
  const clampedZoom = Math.min(Math.max(nextZoom, 1), maxZoom(source, viewport));
  const ratio = (scale * clampedZoom) / previousScale;
  return clampTransform(
    {
      zoom: clampedZoom,
      offsetX: point.x - (point.x - transform.offsetX) * ratio,
      offsetY: point.y - (point.y - transform.offsetY) * ratio,
    },
    source,
    viewport,
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
