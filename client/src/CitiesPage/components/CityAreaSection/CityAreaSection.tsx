import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CityChip } from '~/components/CityChip/CityChip';
import { areaPath } from '~/helpers';

import type { CityAreaSectionProps } from './models';
import * as styles from './styles';

// `areaName` comes straight from the server, already resolved to Hebrew, and
// renders exactly as given with no prefix added in code (design spec, "Area
// block, repeated"). The heading is itself the link to the area page, so
// `/cities` doubles as the area index: there is no separate `/areas` list.
export const CityAreaSection = styled(({ className, areaGroup }: CityAreaSectionProps) => (
  <section className={className}>
    <h2 className="heading">
      <Link className="headingLink" to={areaPath(areaGroup)}>
        <span dir="auto">{areaGroup.areaName}</span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
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
