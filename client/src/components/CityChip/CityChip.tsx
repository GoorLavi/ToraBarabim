import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cityPath } from '~/helpers';
import { lessonCountLabel } from '~/consts';

import type { CityChipProps } from './models';
import * as styles from './styles';

export const CityChip = styled(({ className, city }: CityChipProps) => (
  <Link to={cityPath(city)} className={className}>
    <span className="name" dir="auto">
      {city.name}
    </span>
    <span className="count" dir="auto">
      {lessonCountLabel(city.lessonCount)}
    </span>
  </Link>
))`
  ${styles.CityChip}
`;
