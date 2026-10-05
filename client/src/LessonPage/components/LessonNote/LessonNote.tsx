import styled from 'styled-components';

import * as consts from './consts';
import type { LessonNoteProps } from './models';
import * as styles from './styles';

// The note is about this date, so it sits by the ticket. Renders nothing at
// all when there is no note, rather than an empty panel.
export const LessonNote = styled(({ className, note }: LessonNoteProps) => {
  if (!note) return null;

  return (
    <section className={className}>
      <h2 className="heading" dir="auto">
        {consts.LESSON_NOTE_HEADING}
      </h2>
      <p className="text" dir="auto">
        {note}
      </p>
    </section>
  );
})`
  ${styles.LessonNote}
`;
