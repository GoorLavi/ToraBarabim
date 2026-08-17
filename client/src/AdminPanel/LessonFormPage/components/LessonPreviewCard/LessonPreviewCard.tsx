import styled from 'styled-components';

import * as consts from './consts';
import type { LessonPreviewCardProps } from './models';
import * as styles from './styles';

// Closely mirrors the public `LessonCard`'s visual treatment (poster,
// medallion, title, audience/description line, city), fed live from the
// form's draft state rather than a saved `LessonOccurrence`, which is why
// this is its own component and not a direct reuse (client/CLAUDE.md: a
// child component lifts only once a second parent needs the exact same
// props shape).
export const LessonPreviewCard = styled(({ className, rabbi, title, audience, cityName, weekdayLabel, startTime }: LessonPreviewCardProps) => (
  <div className={className}>
    <p className="label">{consts.PREVIEW_LABEL}</p>

    <article className="card">
      <div className="poster">
        {rabbi?.photoUrl ? <img className="image" src={rabbi.photoUrl} alt="" /> : <div className="image placeholder" aria-hidden="true" />}
        <div className="medallion" dir="ltr">
          <span className="weekday">{weekdayLabel ?? consts.NO_DAY_PLACEHOLDER}</span>
          <span className="time">{startTime || consts.NO_TIME_PLACEHOLDER}</span>
        </div>
      </div>

      <div className="body">
        <h3 className="title" dir="auto">
          {rabbi?.name ?? consts.NO_RABBI_PLACEHOLDER}
        </h3>

        {rabbi && (
          <p className="meta" dir="auto">
            {audience && <span className="audience">{consts.AUDIENCE_LABELS[audience]}</span>}
            {title && <span className="description"> · {title}</span>}
          </p>
        )}

        {cityName && (
          <p className="city" dir="auto">
            {cityName}
          </p>
        )}
      </div>
    </article>
  </div>
))`
  ${styles.LessonPreviewCard}
`;
