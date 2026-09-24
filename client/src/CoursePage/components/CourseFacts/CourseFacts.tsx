import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { NavigationLinks } from '~/components/NavigationLinks/NavigationLinks';
import {
  AUDIENCE_LABELS,
  COURSE_FACT_AUDIENCE_LABEL,
  COURSE_FACT_OPENING_LABEL,
  COURSE_FACT_PRICE_LABEL,
  COURSE_FACT_SCOPE_LABEL,
  COURSE_FACT_VENUE_LABEL,
} from '~/consts';
import { addressLine, courseOpeningDateLongLabel, formatCourseScope, formatPriceShekels, googleMapsHref, placePath, wazeHref } from '~/helpers';

import type { CourseFactsProps } from './models';
import * as styles from './styles';

// A label-and-value row list (design brief A, item 12): the same component
// at every width, never a phone-only or a desktop-only version.
export const CourseFacts = styled(({ className, course }: CourseFactsProps) => {
  const wazeUrl = wazeHref(course.venue);
  const googleMapsUrl = googleMapsHref(course.venue);
  const showNavLinks = Boolean(wazeUrl) && Boolean(googleMapsUrl);

  return (
    <div className={className}>
      <div className="fact">
        <span className="label">{COURSE_FACT_OPENING_LABEL}</span>
        <span className="value" dir="auto">
          {courseOpeningDateLongLabel(course.openingDate)}
        </span>
      </div>

      <div className="fact">
        <span className="label">{COURSE_FACT_SCOPE_LABEL}</span>
        <span className="value" dir="auto">
          {formatCourseScope(course.weeks, course.sessions, course.hours)}
        </span>
      </div>

      <div className="fact">
        <span className="label">{COURSE_FACT_VENUE_LABEL}</span>
        <div className="valueGroup">
          <span className="value" dir="auto">
            {course.venue.kind === 'place' ? (
              <Link className="venueLink" to={placePath({ id: course.venue.placeId, slug: course.venue.slug })}>
                {course.venue.name}
              </Link>
            ) : (
              course.venue.name
            )}
          </span>
          <span className="value street" dir="auto">
            {addressLine(course.venue.street, course.venue.floor)}
          </span>
          <span className="value" dir="auto">
            {course.venue.city}
          </span>

          {showNavLinks && wazeUrl && googleMapsUrl && <NavigationLinks {...{ className: 'navLinks', wazeUrl, googleMapsUrl }} />}
        </div>
      </div>

      <div className="fact">
        <span className="label">{COURSE_FACT_AUDIENCE_LABEL}</span>
        <span className="value" dir="auto">
          {AUDIENCE_LABELS[course.audience]}
        </span>
      </div>

      {course.priceShekels !== undefined && (
        <div className="fact">
          <span className="label">{COURSE_FACT_PRICE_LABEL}</span>
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
