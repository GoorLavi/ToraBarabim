import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import * as consts from './consts';
import type { PhotoViewerProps } from './models';
import * as styles from './styles';

// The full-screen photo viewer, whole photos never cropped (unlike
// `CourseGallery`'s own square frame), portalled through `ResponsiveSheet`.
// Lifted from `CoursePage/components/CourseGallery/components/` once
// `AdminPanel/CourseViewPage` became a second caller.
export const PhotoViewer = styled(({ className, courseName, photos, activeIndex, onNext, onPrev, onDismiss }: PhotoViewerProps) => {
  const activePhoto = photos[activeIndex];
  const hasMultiple = photos.length > 1;
  if (!activePhoto) return null;

  return (
    <ResponsiveSheet {...{ className, ariaLabel: consts.viewerAriaLabel(courseName), onDismiss }}>
      <button type="button" className="close" aria-label={consts.CLOSE_LABEL} onClick={onDismiss}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="stage">
        {hasMultiple && (
          <button type="button" className="arrow prev" aria-label={consts.PREV_LABEL} onClick={onPrev}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <img className="image" src={activePhoto.url} alt="" />

        {hasMultiple && (
          <button type="button" className="arrow next" aria-label={consts.NEXT_LABEL} onClick={onNext}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {hasMultiple && <p className="counter">{consts.counterLabel(activeIndex, photos.length)}</p>}
    </ResponsiveSheet>
  );
})`
  ${styles.PhotoViewer}
`;
