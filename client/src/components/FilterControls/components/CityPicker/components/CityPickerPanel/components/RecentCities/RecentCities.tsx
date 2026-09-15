import styled from 'styled-components';

import * as consts from './consts';
import type { RecentCitiesProps } from './models';
import * as styles from './styles';

// Renders nothing, including its own label, when there is nothing recent
// yet: no placeholder row (build spec, "Open state, before typing").
export const RecentCities = styled(({ className, cities, onSelect }: RecentCitiesProps) => {
  if (cities.length === 0) return null;

  return (
    <div className={className}>
      <p className="label">{consts.RECENT_CITIES_LABEL}</p>
      <ul className="pills">
        {cities.map((city) => (
          <li key={city.id}>
            <button type="button" className="pill" onClick={() => onSelect(city)}>
              <span dir="auto">{city.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
})`
  ${styles.RecentCities}
`;
