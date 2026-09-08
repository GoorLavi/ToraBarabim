import styled from 'styled-components';

import { LESSONS_HEADING, LESSONS_SUBHEADING, RETRY_LABEL } from '~/RabbiPage/consts';

import { LessonRow } from '../LessonRow/LessonRow';
import { LessonRowSkeleton } from '../LessonRowSkeleton/LessonRowSkeleton';
import * as consts from './consts';
import type { LessonsSectionProps } from './models';
import * as styles from './styles';

export const LessonsSection = styled(
  ({ className, showSubheading, items, isPending, isError, onRetry }: LessonsSectionProps) => (
    <section className={className}>
      <div className="heading">
        <h2 className="title">{LESSONS_HEADING}</h2>
        {showSubheading && <p className="sub">{LESSONS_SUBHEADING}</p>}
      </div>

      {isPending && (
        <div className="list" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {consts.SKELETON_ROW_KEYS.map((key) => (
            <div className="cell" key={key}>
              <LessonRowSkeleton />
            </div>
          ))}
        </div>
      )}

      {!isPending && isError && (
        <div className="error" role="alert">
          <p className="message">{consts.ERROR_MESSAGE}</p>
          <button type="button" className="retry" onClick={onRetry}>
            {RETRY_LABEL}
          </button>
        </div>
      )}

      {!isPending && !isError && items && items.length === 0 && <p className="empty">{consts.NO_UPCOMING_OCCURRENCES_MESSAGE}</p>}

      {!isPending && !isError && items && items.length > 0 && (
        <div className="list">
          {items.map((item) => (
            <div className="cell" key={`${item.lessonId}-${item.date}`}>
              <LessonRow lesson={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  ),
)`
  ${styles.LessonsSection}
`;
