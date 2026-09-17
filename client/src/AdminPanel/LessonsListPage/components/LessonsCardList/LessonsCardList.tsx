import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { lessonHasOwnTitle, lessonPrimaryLabel } from '~/AdminPanel/helpers';
import { lessonDayTimeLabel } from '~/AdminPanel/LessonsListPage/helpers';
import * as parentConsts from '~/AdminPanel/LessonsListPage/consts';
import { AUDIENCE_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

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
            {lessonPrimaryLabel(row.lesson, row.rabbi)}
          </span>
          {lessonHasOwnTitle(row.lesson) && row.rabbi && (
            <span className="secondary" dir="auto">
              {rabbiDisplayName(row.rabbi)}
            </span>
          )}
        </div>

        <div className="meta" dir="auto">
          {lessonDayTimeLabel(row.lesson)}
        </div>

        <div className="tags">
          <span className="tag">{row.lesson.recurrence.kind === 'weekly' ? parentConsts.RECURRING_TAG_LABEL : parentConsts.ONE_TIME_TAG_LABEL}</span>
          <span className="tag audience">{AUDIENCE_LABELS[row.lesson.audience]}</span>
          <span className="tag city" dir="auto">
            {row.lesson.place.cityName}
          </span>
        </div>

        <Link className="edit" to={ADMIN_ROUTES.lessonView(row.lesson.id)}>
          {DETAILS_LABEL}
        </Link>
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsCardList}
`;
