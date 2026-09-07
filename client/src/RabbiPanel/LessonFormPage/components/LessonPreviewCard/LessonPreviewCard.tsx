import styled from 'styled-components';

import * as consts from './consts';
import type { LessonPreviewCardProps } from './models';
import * as styles from './styles';

// Closely mirrors the public `LessonCard`'s visual treatment, fed live
// from the form's draft state. The rabbi is always the signed-in one here
// (no rabbi picker on this form), so `rabbiName`/`rabbiPhotoUrl` come from
// `useRabbiProfile` rather than from the form itself.
export const LessonPreviewCard = styled(
  ({ className, rabbiName, rabbiPhotoUrl, title, audience, cityName, weekdayLabel, startTime }: LessonPreviewCardProps) => (
    <div className={className}>
      <p className="label">{consts.PREVIEW_LABEL}</p>

      <article className="card">
        <div className="poster">
          {rabbiPhotoUrl ? <img className="image" src={rabbiPhotoUrl} alt="" /> : <div className="image placeholder" aria-hidden="true" />}
          <div className="medallion" dir="ltr">
            <span className="weekday">{weekdayLabel ?? consts.NO_DAY_PLACEHOLDER}</span>
            <span className="time">{startTime || consts.NO_TIME_PLACEHOLDER}</span>
          </div>
        </div>

        <div className="body">
          <h3 className="title" dir="auto">
            {rabbiName}
          </h3>

          <p className="meta" dir="auto">
            {audience && <span className="audience">{consts.AUDIENCE_LABELS[audience]}</span>}
            {title && <span className="description"> · {title}</span>}
          </p>

          {cityName && (
            <p className="city" dir="auto">
              {cityName}
            </p>
          )}
        </div>
      </article>
    </div>
  ),
)`
  ${styles.LessonPreviewCard}
`;
