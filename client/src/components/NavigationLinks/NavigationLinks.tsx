import styled from 'styled-components';

import * as consts from './consts';
import type { NavigationLinksProps } from './models';
import * as styles from './styles';

// Both brand marks are a flat list of `<path>`s, each with its own literal
// fill, so one renderer covers both icons.
const renderIconPath = ({ d, fill }: { d: string; fill: string }, index: number) => <path key={index} d={d} fill={fill} />;

// The two navigation links every venue on the site offers, always in their
// full-colour brand marks (0027-full-color-brand-marks-on-navigation-links.md).
// Lifted out of LessonTicket once CourseFacts became a second caller: the
// button shape and its colors stay each caller's own (styles.ts).
export const NavigationLinks = styled(({ className, heading, wazeUrl, googleMapsUrl, onNavigate }: NavigationLinksProps) => (
  <div className={className}>
    {heading && (
      <p className="heading" dir="auto">
        {heading}
      </p>
    )}

    <a
      className="navButton waze"
      href={wazeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={consts.WAZE_ARIA_LABEL}
      onClick={() => onNavigate?.('waze')}
    >
      <svg className="icon waze" viewBox={consts.WAZE_ICON_VIEW_BOX} aria-hidden="true">
        {consts.WAZE_ICON_PATHS.map(renderIconPath)}
      </svg>
      <span dir="ltr">{consts.WAZE_LABEL}</span>
    </a>

    <a
      className="navButton googleMaps"
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={consts.GOOGLE_MAPS_ARIA_LABEL}
      onClick={() => onNavigate?.('googleMaps')}
    >
      <svg className="icon googleMaps" viewBox={consts.GOOGLE_MAPS_ICON_VIEW_BOX} aria-hidden="true">
        {consts.GOOGLE_MAPS_ICON_PATHS.map(renderIconPath)}
      </svg>
      <span dir="ltr">{consts.GOOGLE_MAPS_LABEL}</span>
    </a>
  </div>
))`
  ${styles.NavigationLinks}
`;
