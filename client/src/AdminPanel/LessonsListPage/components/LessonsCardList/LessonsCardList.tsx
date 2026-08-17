import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/LessonsListPage/consts';
import { lessonHasOwnTitle, lessonPrimaryLabel, recurrenceWhenLabel } from '~/AdminPanel/LessonsListPage/helpers';

import type { LessonsCardListProps } from './models';
import * as styles from './styles';

// Phone only (hidden at `md` and up in styles.ts); `LessonsTable` carries
// the same data on desktop.
export const LessonsCardList = styled(({ className, rows }: LessonsCardListProps) => (
  <ul className={className}>
    {rows.map((row) => (
      <li key={row.lesson.id} className="card">
        <div className="lesson">
          <span className="primary" dir="auto">
            {lessonPrimaryLabel(row)}
          </span>
          {lessonHasOwnTitle(row) && row.rabbi && (
            <span className="secondary" dir="auto">
              {row.rabbi.name}
            </span>
          )}
        </div>

        <div className="meta">
          <span dir="auto">{recurrenceWhenLabel(row.lesson)}</span>
          <span dir="ltr">{row.lesson.startTime}</span>
        </div>

        <div className="tags">
          <span className="tag">{row.lesson.recurrence.kind === 'weekly' ? parentConsts.RECURRING_TAG_LABEL : parentConsts.ONE_TIME_TAG_LABEL}</span>
          <span className="tag audience">{parentConsts.LESSON_AUDIENCE_LABELS[row.lesson.audience]}</span>
          <span className="tag city" dir="auto">
            {row.place?.city ?? parentConsts.UNKNOWN_PLACE_FALLBACK}
          </span>
        </div>

        <Link className="edit" to={ADMIN_ROUTES.lessonEdit(row.lesson.id)}>
          {parentConsts.EDIT_LABEL}
        </Link>
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsCardList}
`;
