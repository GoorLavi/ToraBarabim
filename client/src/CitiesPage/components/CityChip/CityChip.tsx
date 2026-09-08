import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cityLessonCountLabel } from './helpers';
import type { CityChipProps } from './models';
import * as styles from './styles';

export const CityChip = styled(({ className, city }: CityChipProps) => (
  <Link to={`/cities/${encodeURIComponent(city.name)}`} className={className}>
    <span className="name" dir="auto">
      {city.name}
    </span>
    <span className="count" dir="auto">
      {cityLessonCountLabel(city.lessonCount)}
    </span>
  </Link>
))`
  ${styles.CityChip}
`;
