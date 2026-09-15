import styled from 'styled-components';

import { lessonCountLabel } from '~/consts';

import * as consts from './consts';
import * as helpers from './helpers';
import type { CityAreaBlockProps } from './models';
import * as styles from './styles';

// The area label is a caption, not a link: unlike `CityAreaSection` on
// `/cities`, there is no area page to send this tap to, only city
// selection (build spec, "Open state, before typing").
export const CityAreaBlock = styled(({ className, areaGroup, isExpanded, onExpand, onSelect }: CityAreaBlockProps) => {
  const cities = helpers.visibleCities(areaGroup.cities, isExpanded);
  const hiddenCount = helpers.hiddenCityCount(areaGroup.cities);

  return (
    <section className={className}>
      <p className="areaLabel" dir="auto">
        {areaGroup.areaName}
      </p>
      <ul className="grid">
        {cities.map((city) => (
          <li key={city.id} className="cell">
            <button type="button" className="cityButton" onClick={() => onSelect({ id: city.id, name: city.name })}>
              <span className="name" dir="auto">
                {city.name}
              </span>
              <span className="count" dir="auto">
                {lessonCountLabel(city.lessonCount)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!isExpanded && hiddenCount > 0 && (
        <button type="button" className="expand" onClick={onExpand}>
          {consts.remainingCitiesLabel(hiddenCount)}
        </button>
      )}
    </section>
  );
})`
  ${styles.CityAreaBlock}
`;
