import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import * as helpers from '../../helpers';
import type { CropRect, CropTransform, ImageDimensions } from '../../models';
import * as consts from './consts';
import type { Point, PhotoCropStepProps } from './models';
import * as styles from './styles';

const cropToFile = (image: HTMLImageElement, rect: CropRect): Promise<File> => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('canvas 2d context unavailable for photo crop'));
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('cropped canvas produced no blob'));
          return;
        }
        resolve(new File([blob], consts.CROPPED_PHOTO_FILE_NAME, { type: consts.CROP_OUTPUT_TYPE }));
      },
      consts.CROP_OUTPUT_TYPE,
      consts.CROP_OUTPUT_QUALITY,
    );
  });
};

// Portalled into `document.body`, same reasoning as `ResponsiveSheet`: this
// is `position: fixed`, and a transformed ancestor would become its
// containing block, covering only that ancestor's box instead of the
// viewport. Never part of the server output, since it only ever mounts
// after a person has picked a file.
export const PhotoCropStep = styled(({ className, file, imageUrl, sourceDimensions, onConfirm, onCancel }: PhotoCropStepProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStartRef = useRef<{ distance: number; transform: CropTransform } | undefined>(undefined);

  const [viewportWidth, setViewportWidth] = useState<number | undefined>(undefined);
  const [transform, setTransform] = useState<CropTransform | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setViewportWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The viewport frame is always drawn at 16:9 (styles.ts), so its height
  // follows its own measured width rather than needing a second measurement.
  const viewport: ImageDimensions | undefined = useMemo(
    () => (viewportWidth ? { width: viewportWidth, height: viewportWidth / helpers.CROP_ASPECT_RATIO } : undefined),
    [viewportWidth],
  );

  useEffect(() => {
    if (!viewport) return;
    setTransform((previous) => (previous ? helpers.clampTransform(previous, sourceDimensions, viewport) : helpers.initialTransform(sourceDimensions, viewport)));
  }, [viewport, sourceDimensions]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || !viewport) return;

    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const direction = event.deltaY > 0 ? -1 : 1;
      setTransform((previous) => previous && helpers.zoomAroundPoint(previous, point, previous.zoom + direction * consts.WHEEL_ZOOM_STEP, sourceDimensions, viewport));
    };

    // React attaches `onWheel` as a passive listener, so `preventDefault`
    // inside it would not actually stop the page from scrolling behind this
    // overlay while someone zooms with a mouse wheel; a native listener is
    // the only way to opt back into a blocking one.
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [viewport, sourceDimensions]);

  const viewportPoint = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer id the browser does not recognise as an active, capturable
      // pointer (true of a synthetic pointer, such as the one a story uses
      // to frame a mid-drag state) simply is not captured: the gesture below
      // still works for as long as the pointer stays over the viewport, it
      // only loses tracking past its edge.
    }

    const point = viewportPoint(event);
    pointersRef.current.set(event.pointerId, point);

    const [first, second] = Array.from(pointersRef.current.values());
    if (first && second && transform) {
      pinchStartRef.current = { distance: helpers.distanceBetween(first, second), transform };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const previous = pointersRef.current.get(event.pointerId);
    if (!previous || !transform || !viewport) return;

    const point = viewportPoint(event);
    pointersRef.current.set(event.pointerId, point);

    const [first, second] = Array.from(pointersRef.current.values());
    if (first && second) {
      const start = pinchStartRef.current;
      if (!start) return;
      const nextZoom = start.transform.zoom * (helpers.distanceBetween(first, second) / start.distance);
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      setTransform(helpers.zoomAroundPoint(start.transform, midpoint, nextZoom, sourceDimensions, viewport));
      return;
    }

    if (pointersRef.current.size === 1) {
      setTransform(
        helpers.clampTransform(
          { ...transform, offsetX: transform.offsetX + (point.x - previous.x), offsetY: transform.offsetY + (point.y - previous.y) },
          sourceDimensions,
          viewport,
        ),
      );
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = undefined;
  };

  const handleConfirm = async (): Promise<void> => {
    if (!transform || !viewport || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const rect = helpers.sourceCropRect(transform, sourceDimensions, viewport);
      const croppedFile = await cropToFile(imgRef.current, rect);
      onConfirm(croppedFile);
    } catch {
      // Fail open: hand the original, uncropped file to the caller rather
      // than trap the person on this screen with no way forward. The
      // server's own ratio and size validation is the backstop if that file
      // does not clear it on its own; a canvas producing no blob at all is
      // not expected from a same-origin blob URL, so this is a safety net
      // rather than an anticipated path.
      onConfirm(file);
    } finally {
      setIsProcessing(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    // `dir="rtl"` named explicitly rather than left to inherit: this is
    // portalled straight onto `document.body`, outside whatever element set
    // direction for the rest of the page (root.tsx's `<html dir="rtl">` in
    // the app, the preview decorator's own wrapping element in Storybook),
    // so an ancestor's `dir` is not guaranteed to reach it.
    <div className={className} dir="rtl" role="dialog" aria-modal="true" aria-label={consts.CROP_STEP_TITLE}>
      <div className="header">
        <button type="button" className="cancel" onClick={onCancel}>
          {consts.CROP_CANCEL_LABEL}
        </button>
        <span className="title">{consts.CROP_STEP_TITLE}</span>
        <button type="button" className="confirm" onClick={() => void handleConfirm()} disabled={!transform || isProcessing}>
          {isProcessing ? consts.CROP_PROCESSING_LABEL : consts.CROP_CONFIRM_LABEL}
        </button>
      </div>

      <div className="stage">
        <div
          className="viewport"
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        >
          {transform && viewport && (
            <img
              ref={imgRef}
              className="image"
              src={imageUrl}
              alt=""
              draggable={false}
              // Custom properties are the per-instance values styles.ts reads
              // (comment there says why); @types/react ships CSSProperties
              // with no index signature for them, so this is the standard
              // assertion rather than a real type-safety gap.
              style={
                {
                  '--crop-image-width': `${sourceDimensions.width * helpers.coverScale(sourceDimensions, viewport) * transform.zoom}px`,
                  '--crop-image-height': `${sourceDimensions.height * helpers.coverScale(sourceDimensions, viewport) * transform.zoom}px`,
                  '--crop-offset-x': `${transform.offsetX}px`,
                  '--crop-offset-y': `${transform.offsetY}px`,
                } as CSSProperties
              }
            />
          )}
        </div>
      </div>

      <p className="hint">{consts.CROP_STEP_HINT}</p>
    </div>,
    document.body,
  );
})`
  ${styles.PhotoCropStep}
`;
