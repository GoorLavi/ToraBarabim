import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as consts from '~/CityPage/consts';
import { areaPath } from '~/helpers';

import type { AreaLinkProps } from './models';
import * as styles from './styles';

// Two callers: the city page's own title block, and CityEmptyState below
// it once a city has widened to its area (design spec, "close the hole").
export const AreaLink = styled(({ className, areaSlug, areaName }: AreaLinkProps) => (
  <Link className={className} to={areaPath({ slug: areaSlug })}>
    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span dir="auto">{consts.areaLinkLabel(areaName)}</span>
  </Link>
))`
  ${styles.AreaLink}
`;
