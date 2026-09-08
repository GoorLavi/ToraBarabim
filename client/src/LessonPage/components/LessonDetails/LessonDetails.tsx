import styled from 'styled-components';

import * as consts from './consts';
import type { LessonDetailsProps } from './models';
import * as styles from './styles';

// No bio, no notes panel, no title (design spec, "Required fields only"):
// both sections are individually optional, and the component renders
// nothing at all when neither is present, rather than an empty panel.
export const LessonDetails = styled(({ className, bio, note }: LessonDetailsProps) => {
  if (!bio && !note) return null;

  return (
    <div className={className}>
      {bio && (
        <section className="section">
          <h2 className="heading" dir="auto">
            {consts.ABOUT_RABBI_HEADING}
          </h2>
          <p className="text" dir="auto">
            {bio}
          </p>
        </section>
      )}

      {note && (
        <section className="section noteSection">
          <h2 className="heading" dir="auto">
            {consts.LESSON_NOTE_HEADING}
          </h2>
          <p className="text" dir="auto">
            {note}
          </p>
        </section>
      )}
    </div>
  );
})`
  ${styles.LessonDetails}
`;
