import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { lessonCountLabel } from '~/consts';
import { areaPath } from '~/helpers';

import type { AreaChipProps } from './models';
import * as styles from './styles';

export const AreaChip = styled(({ className, area }: AreaChipProps) => (
  <Link to={areaPath(area)} className={className}>
    <span className="name" dir="auto">
      {area.areaName}
    </span>
    <span className="count" dir="auto">
      {lessonCountLabel(area.lessonCount)}
    </span>
  </Link>
))`
  ${styles.AreaChip}
`;
