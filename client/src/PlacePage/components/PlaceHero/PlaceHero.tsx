import classNames from 'classnames';
import styled from 'styled-components';

import { googleMapsHref, wazeHref } from '~/helpers';

import * as consts from './consts';
import { placeMetaLabel } from './helpers';
import type { PlaceHeroProps } from './models';
import * as styles from './styles';

// Both brand marks are a flat list of `<path>`s, each with its own literal
// fill, so one renderer covers both icons (mirrors LessonTicket.tsx).
const renderIconPath = ({ d, fill }: { d: string; fill: string }, index: number) => <path key={index} d={d} fill={fill} />;

// The plum head card: photo when there is one, the name, the address, the
// lesson count, then Waze and Google Maps. Built no-photo-first: with no
// photo the band does not exist, no placeholder and no reserved space
// (design spec, "With no photo the band does not exist").
export const PlaceHero = styled(({ className, place, lessonCount }: PlaceHeroProps) => {
  const metaLabel = placeMetaLabel(lessonCount);
  const wazeUrl = wazeHref(place);
  const googleMapsUrl = googleMapsHref(place);
  const showNavRow = Boolean(wazeUrl) && Boolean(googleMapsUrl);

  return (
    <div className={classNames(className, { noPhoto: !place.photoUrl })}>
      {place.photoUrl && <img className="photo" src={place.photoUrl} alt="" />}

      <div className="content">
        <h1 className="name" dir="auto">
          {place.name}
        </h1>

        <div className="address">
          <p className="line" dir="auto">
            {place.street}
          </p>
          {place.floor && (
            <p className="line" dir="auto">
              {place.floor}
            </p>
          )}
          <p className="line" dir="auto">
            {place.city}
          </p>
        </div>

        {metaLabel && <p className="meta">{metaLabel}</p>}

        {showNavRow && wazeUrl && googleMapsUrl && (
          <div className="navRow">
            <a className="navButton waze" href={wazeUrl} target="_blank" rel="noopener noreferrer" aria-label={consts.WAZE_ARIA_LABEL}>
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
            >
              <svg className="icon googleMaps" viewBox={consts.GOOGLE_MAPS_ICON_VIEW_BOX} aria-hidden="true">
                {consts.GOOGLE_MAPS_ICON_PATHS.map(renderIconPath)}
              </svg>
              <span dir="ltr">{consts.GOOGLE_MAPS_LABEL}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
})`
  ${styles.PlaceHero}
`;
