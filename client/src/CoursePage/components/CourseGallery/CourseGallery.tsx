import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { PhotoViewer } from '~/components/PhotoViewer/PhotoViewer';
import * as photoViewerConsts from '~/components/PhotoViewer/consts';

import * as consts from './consts';
import { clampedIndex } from './helpers';
import type { CourseGalleryProps } from './models';
import * as styles from './styles';
import { useVisibleSlideIndex } from './useVisibleSlideIndex';

// A square frame with the current photo centre-cut into it (the cover is
// natively 3:4, every other photo whatever ratio it was uploaded at), a
// thumbnail strip beside or below it depending on width (styles.ts), and a
// full-screen `PhotoViewer` opened by tapping the frame. No gallery chrome
// (arrows, counter, thumbnails) when the course has only its required
// cover and nothing else to browse.
export const CourseGallery = styled(({ className, courseName, photos }: CourseGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const activePhoto = photos[activeIndex];
  const hasMultiple = photos.length > 1;

  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { visibleIndex: phoneVisibleIndex, freezeUntilSettled } = useVisibleSlideIndex(slidesContainerRef, slideRefs, photos.length);

  // The thumbnail strip and its `aria-current` are the one shared indicator
  // for both galleries (design gate round 4 finding: they used to follow
  // only the desktop frame's own index, never a phone swipe), so a swipe
  // that never calls `goTo` still moves them, the same index the phone
  // counter already shows.
  useEffect(() => {
    setActiveIndex(phoneVisibleIndex);
  }, [phoneVisibleIndex]);

  if (!activePhoto) return null;

  // The one place either gallery moves to a photo: sets the desktop frame's
  // own index and, through the target slide's own `scrollIntoView`, scrolls
  // the phone strip there too. `scrollIntoView`'s `inline: 'start'` is
  // direction-aware (unlike a raw `scrollLeft`), landing the same way the
  // strip's own `scroll-snap-align: start` already does for a swipe.
  // `freezeUntilSettled` sets the phone tracker straight to the destination
  // just requested and holds it there for the length of the scroll it is
  // about to start, so a fast second tap (design gate round 5 finding)
  // computes its own target from that destination, never a slide only
  // passed through, and the sync effect above never fights this call's own
  // `setActiveIndex` back down mid-scroll.
  const goTo = (index: number): void => {
    const clamped = clampedIndex(index, photos.length);
    setActiveIndex(clamped);
    freezeUntilSettled(clamped);
    slideRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  const atStart = activeIndex === 0;
  const atEnd = activeIndex === photos.length - 1;
  const phoneAtStart = phoneVisibleIndex === 0;
  const phoneAtEnd = phoneVisibleIndex === photos.length - 1;

  return (
    <div className={className}>
      {/* Phone only (styles.ts): every photo as its own full-bleed slide in
          a native horizontal scroller, the next one peeking at the inline
          end (the rails' own swipe signal, RabbiRow/styles.ts), a swipe
          the browsing gesture there same as the desktop frame's arrows.
          The 48px arrows and the counter overlay the strip itself rather
          than a second, hidden-until-now frame underneath it (design gate
          round 3 finding: showing both doubled every photo). */}
      <div className="stage">
        <div className="slides" ref={slidesContainerRef}>
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="slide"
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              onClick={() => {
                setActiveIndex(index);
                setIsViewerOpen(true);
              }}
              aria-label={consts.openSlideViewerLabel(index)}
            >
              <img className="image" src={photo.url} alt="" />
            </button>
          ))}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              className="arrow prev"
              disabled={phoneAtStart}
              aria-label={photoViewerConsts.PREV_LABEL}
              onClick={() => goTo(phoneVisibleIndex - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="arrow next"
              disabled={phoneAtEnd}
              aria-label={photoViewerConsts.NEXT_LABEL}
              onClick={() => goTo(phoneVisibleIndex + 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="counter">{photoViewerConsts.counterLabel(phoneVisibleIndex, photos.length)}</span>
          </>
        )}
      </div>

      <div className="frame">
        <button type="button" className="imageButton" onClick={() => setIsViewerOpen(true)} aria-label={consts.OPEN_VIEWER_LABEL}>
          <img className="image" src={activePhoto.url} alt="" />
        </button>

        {hasMultiple && (
          <>
            <button type="button" className="arrow prev" disabled={atStart} aria-label={photoViewerConsts.PREV_LABEL} onClick={() => goTo(activeIndex - 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="arrow next" disabled={atEnd} aria-label={photoViewerConsts.NEXT_LABEL} onClick={() => goTo(activeIndex + 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="counter">{photoViewerConsts.counterLabel(activeIndex, photos.length)}</span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="thumbnails">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className={classNames('thumbnail', { active: index === activeIndex })}
              aria-label={consts.thumbnailLabel(index)}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
            >
              <img src={photo.url} alt="" />
            </button>
          ))}
        </div>
      )}

      {isViewerOpen && (
        <PhotoViewer
          {...{
            courseName,
            photos,
            activeIndex,
            onNext: () => goTo(activeIndex + 1),
            onPrev: () => goTo(activeIndex - 1),
            onDismiss: () => setIsViewerOpen(false),
          }}
        />
      )}
    </div>
  );
})`
  ${styles.CourseGallery}
`;
