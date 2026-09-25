import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { PhotoViewer } from '~/components/PhotoViewer/PhotoViewer';

import * as consts from './consts';
import { clampedIndex } from './helpers';
import type { CourseGalleryProps } from './models';
import * as styles from './styles';

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

  if (!activePhoto) return null;

  const goTo = (index: number): void => setActiveIndex(clampedIndex(index, photos.length));
  const atStart = activeIndex === 0;
  const atEnd = activeIndex === photos.length - 1;

  return (
    <div className={className}>
      <div className="frame">
        <button type="button" className="imageButton" onClick={() => setIsViewerOpen(true)} aria-label={consts.OPEN_VIEWER_LABEL}>
          <img className="image" src={activePhoto.url} alt="" />
        </button>

        {hasMultiple && (
          <>
            <button type="button" className="arrow prev" disabled={atStart} aria-label={consts.PREV_LABEL} onClick={() => goTo(activeIndex - 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="arrow next" disabled={atEnd} aria-label={consts.NEXT_LABEL} onClick={() => goTo(activeIndex + 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="counter">{consts.counterLabel(activeIndex, photos.length)}</span>
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
