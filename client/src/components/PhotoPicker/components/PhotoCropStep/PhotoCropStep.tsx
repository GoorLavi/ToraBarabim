import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import * as helpers from '../../helpers';
import type { CropRect, CropTransform, ImageDimensions } from '../../models';
import * as consts from './consts';
import * as stepHelpers from './helpers';
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
  const stageRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStartRef = useRef<{ distance: number; transform: CropTransform } | undefined>(undefined);

  const [stageSize, setStageSize] = useState<ImageDimensions | undefined>(undefined);
  const [transform, setTransform] = useState<CropTransform | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  // Locks the page behind the overlay for as long as it is mounted, so a
  // touch or wheel gesture that misses the stage cannot scroll the page
  // underneath it (design gate finding F5). Restored on every exit path:
  // confirm and cancel both unmount this component, which runs this cleanup.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const contentRect = entries[0]?.contentRect;
      if (contentRect && contentRect.width && contentRect.height) setStageSize({ width: contentRect.width, height: contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The crop window: the largest 16:9 box the stage's own measured content
  // area has room for (helpers.ts), capped at its historical desktop width.
  // Every helper below still calls this "viewport", matching the parameter
  // name in ../../helpers.ts, even though the DOM element it now sizes is
  // `.window` rather than the stage itself: the photo is no longer clipped
  // to it (styles.ts).
  const viewport: ImageDimensions | undefined = useMemo(() => (stageSize ? stepHelpers.windowSizeForStage(stageSize) : undefined), [stageSize]);

  const hasNoFramingRoom = useMemo(() => (viewport ? stepHelpers.hasNoFramingRoom(sourceDimensions, viewport) : false), [sourceDimensions, viewport]);

  useEffect(() => {
    if (!viewport) return;
    setTransform((previous) => (previous ? helpers.clampTransform(previous, sourceDimensions, viewport) : helpers.initialTransform(sourceDimensions, viewport)));
  }, [viewport, sourceDimensions]);

  // Both the drag/pinch handlers below and the wheel handler here read pointer
  // and cursor positions in window-local coordinates (the coordinate space
  // every helpers.ts function expects), regardless of which element actually
  // received the event: the stage is the drag target (design gate F3/F4,
  // "the drag target becomes the whole photo rather than the window alone"),
  // but the window is what the math is anchored to.
  const pointFromClient = (clientX: number, clientY: number): Point => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  useEffect(() => {
    const element = stageRef.current;
    if (!element || !viewport) return;

    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const point = pointFromClient(event.clientX, event.clientY);
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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!windowRef.current) return;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer id the browser does not recognise as an active, capturable
      // pointer (true of a synthetic pointer, such as the one a story uses
      // to frame a mid-drag state) simply is not captured: the gesture below
      // still works for as long as the pointer stays over the stage, it
      // only loses tracking past its edge.
    }

    const point = pointFromClient(event.clientX, event.clientY);
    pointersRef.current.set(event.pointerId, point);

    const [first, second] = Array.from(pointersRef.current.values());
    if (first && second && transform) {
      pinchStartRef.current = { distance: helpers.distanceBetween(first, second), transform };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const previous = pointersRef.current.get(event.pointerId);
    if (!previous || !transform || !viewport) return;

    const point = pointFromClient(event.clientX, event.clientY);
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
        <span className="title">{consts.CROP_STEP_TITLE}</span>
      </div>

      <div
        className="stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        {transform && viewport && (
          <div
            className="window"
            ref={windowRef}
            style={{ '--crop-window-width': `${viewport.width}px`, '--crop-window-height': `${viewport.height}px` } as CSSProperties}
          >
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
          </div>
        )}
      </div>

      <div className="footer">
        <p className="hint">{hasNoFramingRoom ? consts.CROP_STEP_HINT_NO_FRAMING_ROOM : consts.CROP_STEP_HINT}</p>

        <div className="actions">
          <button type="button" className="cancel" onClick={onCancel}>
            {consts.CROP_CANCEL_LABEL}
          </button>
          <button type="button" className="confirm" onClick={() => void handleConfirm()} disabled={!transform || isProcessing}>
            {isProcessing ? consts.CROP_PROCESSING_LABEL : consts.CROP_CONFIRM_LABEL}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
})`
  ${styles.PhotoCropStep}
`;
