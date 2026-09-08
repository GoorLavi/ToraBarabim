import styled from 'styled-components';

import { CityChip } from '../CityChip/CityChip';
import type { CityAreaSectionProps } from './models';
import * as styles from './styles';

// `areaName` comes straight from the server, already resolved to Hebrew, and
// renders exactly as given with no prefix added in code (design spec, "Area
// block, repeated").
export const CityAreaSection = styled(({ className, areaGroup }: CityAreaSectionProps) => (
  <section className={className}>
    <h2 className="heading" dir="auto">
      {areaGroup.areaName}
    </h2>
    <ul className="grid">
      {areaGroup.cities.map((city) => (
        <li key={city.id} className="cell">
          <CityChip city={city} />
        </li>
      ))}
    </ul>
  </section>
))`
  ${styles.CityAreaSection}
`;
