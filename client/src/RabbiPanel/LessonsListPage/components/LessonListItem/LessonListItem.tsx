import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import * as parentConsts from '~/RabbiPanel/LessonsListPage/consts';
import { lessonPrimaryLabel, whenLabel } from '~/RabbiPanel/LessonsListPage/helpers';

import type { LessonListItemProps } from './models';
import * as styles from './styles';

// The lesson list has no delete affordance of its own by design (design
// doc, section 4: deleting lives only at the bottom of the edit form, so
// a scroll never accidentally deletes a lesson).
export const LessonListItem = styled(({ className, lesson }: LessonListItemProps) => (
  <li className={className}>
    <span className="title" dir="auto">
      {lessonPrimaryLabel(lesson)}
    </span>
    <span className="when" dir="auto">
      {whenLabel(lesson)}
    </span>

    <div className="tags">
      <span className="tag">{lesson.recurrence.kind === 'weekly' ? parentConsts.RECURRING_TAG_LABEL : parentConsts.ONE_TIME_TAG_LABEL}</span>
      <span className="tag">{parentConsts.AUDIENCE_LABELS[lesson.audience]}</span>
      <span className="tag" dir="auto">
        {lesson.place.cityName}
      </span>
    </div>

    <Link className="edit" to={RABBI_ROUTES.lessonEdit(lesson.id)}>
      {parentConsts.EDIT_LESSON_LABEL}
    </Link>
  </li>
))`
  ${styles.LessonListItem}
`;
