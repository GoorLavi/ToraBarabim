import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { AUDIENCE_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';
import { PLACE_ROUTES } from '~/PlacePanel/consts';
import * as parentConsts from '~/PlacePanel/LessonsListPage/consts';
import { lessonPrimaryLabel, whenLabel } from '~/PlacePanel/LessonsListPage/helpers';

import type { LessonListItemProps } from './models';
import * as styles from './styles';

// The lesson list has no delete affordance of its own, mirroring
// `RabbiPanel/LessonsListPage/components/LessonListItem`, and a place can
// never delete a lesson at all (build brief). The third tag names the
// rabbi rather than the city: the city is fixed (this place's own), the
// rabbi is the one thing that varies lesson to lesson here.
export const LessonListItem = styled(({ className, lesson, rabbi }: LessonListItemProps) => (
  <li className={className}>
    <span className="title" dir="auto">
      {lessonPrimaryLabel(lesson)}
    </span>
    <span className="when" dir="auto">
      {whenLabel(lesson)}
    </span>

    <div className="tags">
      <span className="tag">{lesson.recurrence.kind === 'weekly' ? parentConsts.RECURRING_TAG_LABEL : parentConsts.ONE_TIME_TAG_LABEL}</span>
      <span className="tag">{AUDIENCE_LABELS[lesson.audience]}</span>
      {rabbi && (
        <span className="tag" dir="auto">
          {rabbiDisplayName(rabbi)}
        </span>
      )}
    </div>

    <Link className="edit" to={PLACE_ROUTES.lessonEdit(lesson.id)}>
      {parentConsts.EDIT_LESSON_LABEL}
    </Link>
  </li>
))`
  ${styles.LessonListItem}
`;
