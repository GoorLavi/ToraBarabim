import styled from 'styled-components';

import { AUDIENCE_LABELS } from '~/consts';
import * as pageConsts from '~/CoursePage/consts';
import { formatPriceShekels } from '~/CoursePage/helpers';
import { addressLine, courseOpeningDateLongLabel, formatCourseScope, googleMapsHref, wazeHref } from '~/helpers';

import * as consts from './consts';
import type { CourseFactsProps } from './models';
import * as styles from './styles';

export const CourseFacts = styled(({ className, course }: CourseFactsProps) => {
  const wazeUrl = wazeHref(course.venue);
  const googleMapsUrl = googleMapsHref(course.venue);
  const showNavLinks = Boolean(wazeUrl) && Boolean(googleMapsUrl);

  return (
    <div className={className}>
      <div className="fact">
        <span className="label">{pageConsts.FACT_OPENING_LABEL}</span>
        <span className="value" dir="auto">
          {courseOpeningDateLongLabel(course.openingDate)}
        </span>
      </div>

      <div className="fact">
        <span className="label">{pageConsts.FACT_SCOPE_LABEL}</span>
        <span className="value" dir="auto">
          {formatCourseScope(course.weeks, course.sessions, course.hours)}
        </span>
      </div>

      <div className="fact">
        <span className="label">{pageConsts.FACT_VENUE_LABEL}</span>
        <span className="value" dir="auto">
          {course.venue.name}
        </span>
        <span className="value" dir="auto">
          {addressLine(course.venue.street, course.venue.floor)}
        </span>
        <span className="value" dir="auto">
          {course.venue.city}
        </span>

        {showNavLinks && wazeUrl && googleMapsUrl && (
          <div className="navLinks">
            <a className="navLink" href={wazeUrl} target="_blank" rel="noopener noreferrer" aria-label={consts.WAZE_ARIA_LABEL}>
              {consts.WAZE_LABEL}
            </a>
            <a className="navLink" href={googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label={consts.GOOGLE_MAPS_ARIA_LABEL}>
              {consts.GOOGLE_MAPS_LABEL}
            </a>
          </div>
        )}
      </div>

      <div className="fact">
        <span className="label">{pageConsts.FACT_AUDIENCE_LABEL}</span>
        <span className="value" dir="auto">
          {AUDIENCE_LABELS[course.audience]}
        </span>
      </div>

      {course.priceShekels !== undefined && (
        <div className="fact">
          <span className="label">{pageConsts.FACT_PRICE_LABEL}</span>
          <span className="value" dir="auto">
            {formatPriceShekels(course.priceShekels)}
          </span>
        </div>
      )}
    </div>
  );
})`
  ${styles.CourseFacts}
`;
