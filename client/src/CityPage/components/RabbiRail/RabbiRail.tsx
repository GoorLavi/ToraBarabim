import styled from 'styled-components';

import { whoTeachesHeading } from '~/CityPage/consts';

import { RabbiCell } from './components/RabbiCell/RabbiCell';
import type { RabbiRailProps } from './models';
import * as styles from './styles';

// A row with nothing in it renders nothing, heading included
// (design-system.md, "Every data screen has three states": "the rows
// themselves have no empty state"). The caller only renders this once the
// city is known to have both rabbis and lessons.
export const RabbiRail = styled(({ className, cityName, rabbis }: RabbiRailProps) => {
  if (rabbis.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="heading" dir="auto">
        {whoTeachesHeading(cityName)}
      </h2>
      <ul className="rail">
        {rabbis.map((rabbi) => (
          <li key={rabbi.id}>
            <RabbiCell rabbi={rabbi} />
          </li>
        ))}
      </ul>
    </section>
  );
})`
  ${styles.RabbiRail}
`;
