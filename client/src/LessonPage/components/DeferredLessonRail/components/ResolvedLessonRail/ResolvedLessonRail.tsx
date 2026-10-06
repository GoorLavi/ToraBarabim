import styled from 'styled-components';

import { LESSONS_NEXT_LABEL, LESSONS_PREV_LABEL } from '~/components/Rail/consts';
import { Rail } from '~/components/Rail/Rail';
import { RailHeading } from '~/components/RailHeading/RailHeading';
import { StateCard } from '~/components/StateCard/StateCard';
import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { ResolvedLessonRailProps } from './models';
import * as styles from './styles';

// Renders its own section (or nothing) rather than the page wrapping one
// unconditionally, so an unavailable read leaves no empty, gap-consuming
// section behind. Fail-closed on the content, deliberately: "we could not
// find out" must never read as "there is nothing", so the whole section is
// absent rather than showing an empty card.
export const ResolvedLessonRail = styled(({ className, title, titleTo, resolved, emptyHeading, emptyBody }: ResolvedLessonRailProps) => {
  if (resolved.kind === 'unavailable') return null;

  if (resolved.items.length === 0) {
    return (
      <section className={className}>
        <RailHeading {...{ title, titleTo }} />
        <StateCard {...{ variant: 'empty' as const, headingLevel: 'h3' as const, heading: emptyHeading, body: emptyBody }} />
      </section>
    );
  }

  return (
    <Rail {...{ title, titleTo, prevLabel: LESSONS_PREV_LABEL, nextLabel: LESSONS_NEXT_LABEL }}>
      {resolved.items.map((lesson, index) => (
        <li key={`${lesson.lessonId}-${lesson.date}`}>
          <LessonCard {...{ lesson, surface: 'general' as const, clickContext: { surface: 'lessonPage' as const, position: index } }} />
        </li>
      ))}
    </Rail>
  );
})`
  ${styles.ResolvedLessonRail}
`;
