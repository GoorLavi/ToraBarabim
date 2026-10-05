import classNames from 'classnames';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { CityChip } from '~/components/CityChip/CityChip';
import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import * as consts from './consts';
import type { CityGridProps } from './models';
import * as styles from './styles';

// A row with nothing in it renders nothing at all, heading included: this
// site never puts a heading over an empty rail (design-system.md, "Every
// data screen has three states"). The server sends the busiest cities with
// the lesson count the chip shows, so a chip selects its city directly.
export const CityGrid = styled(({ className, cities, isLoading, isError, selectedCityId, onSelectCity, onClearCity }: CityGridProps) => {
  const hasCities = cities !== undefined && cities.length > 0;

  if (!isLoading && !isError && !hasCities) return null;

  return (
    <section className={className}>
      <div className="heading">
        <div className="titles">
          <h2 className="title">{consts.HEADING}</h2>
          <p className="subtitle">{consts.SUBTITLE}</p>
        </div>
        <TextLink
          className="seeAll"
          to="/cities"
          withChevron
          onClick={() => trackEvent(MIXPANEL_EVENTS.seeAllClick, { target: 'cities', surface: 'home' })}
        >
          {consts.SEE_ALL_LABEL}
        </TextLink>
      </div>

      {isError && (
        <p className={classNames('state', 'error')} role="alert">
          {consts.ERROR_MESSAGE}
        </p>
      )}

      {!isError && isLoading && (
        <p className={classNames('state', 'loading')} aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      )}

      {!isError && !isLoading && hasCities && (
        <ul className="grid">
          {cities.map((city) => (
            <li key={city.id} className="cell">
              <CityChip
                {...{
                  city,
                  lessonCount: city.lessonCount,
                  selected: city.id === selectedCityId,
                  onSelect: () => {
                    if (city.id === selectedCityId) {
                      onClearCity();
                      return;
                    }
                    onSelectCity({ id: city.id, name: city.name });
                    trackEvent(MIXPANEL_EVENTS.filterCity, { cityId: city.id, cityName: city.name, source: 'homeCityGrid' });
                  },
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
})`
  ${styles.CityGrid}
`;
