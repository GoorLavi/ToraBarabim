import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { lessonHasOwnTitle, lessonPrimaryLabel } from '~/AdminPanel/helpers';
import { lessonDayTimeLabel } from '~/AdminPanel/LessonsListPage/helpers';
import * as parentConsts from '~/AdminPanel/LessonsListPage/consts';
import { AUDIENCE_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

import type { LessonsTableProps } from './models';
import * as styles from './styles';

// Desktop only (hidden below `md` in styles.ts); `LessonsCardList` carries
// the same data on a phone. Built from classed `div`s with table ARIA
// roles rather than a native `<table>`: a real `<thead>`/`<tbody>`/`<tr>`
// cannot all carry a class while keeping `>` selectors matching the actual
// DOM (root CLAUDE.md, Styling: never a bare-element selector), and a div
// grid lets every cell stay addressable by its own class.
export const LessonsTable = styled(({ className, rows }: LessonsTableProps) => (
  <div className={className} role="table">
    <div className="headRow" role="row">
      <span className="lesson" role="columnheader">
        שיעור ורב
      </span>
      <span className="when" role="columnheader">
        מתי
      </span>
      <span className="city" role="columnheader">
        עיר
      </span>
      <span className="audience" role="columnheader">
        קהל
      </span>
      <span className="actions" role="columnheader" />
    </div>

    {rows.map((row) => (
      <div key={row.lesson.id} className="row" role="row">
        <span className="lesson" role="cell">
          <span className="primary" dir="auto">
            {lessonPrimaryLabel(row.lesson, row.rabbi)}
          </span>
          {lessonHasOwnTitle(row.lesson) && row.rabbi && (
            <span className="secondary" dir="auto">
              {rabbiDisplayName(row.rabbi)}
            </span>
          )}
        </span>
        <span className="when" role="cell">
          <span className="whenText" dir="auto">
            {lessonDayTimeLabel(row.lesson)}
          </span>
          <span className="tag">{row.lesson.recurrence.kind === 'weekly' ? parentConsts.RECURRING_TAG_LABEL : parentConsts.ONE_TIME_TAG_LABEL}</span>
        </span>
        <span className="city" role="cell" dir="auto">
          {row.lesson.place.cityName}
        </span>
        <span className="audience" role="cell" dir="auto">
          {AUDIENCE_LABELS[row.lesson.audience]}
        </span>
        <span className="actions" role="cell">
          <Link className="edit" to={ADMIN_ROUTES.lessonView(row.lesson.id)}>
            {DETAILS_LABEL}
          </Link>
        </span>
      </div>
    ))}
  </div>
))`
  ${styles.LessonsTable}
`;
