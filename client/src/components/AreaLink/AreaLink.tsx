import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { areaLinkLabel } from '~/consts';
import { areaPath } from '~/helpers';

import type { AreaLinkProps } from './models';
import * as styles from './styles';

// Two callers: the city page's own title block and CityEmptyState once a
// city has widened to its area.
export const AreaLink = styled(({ className, areaSlug, areaName }: AreaLinkProps) => (
  <Link className={className} to={areaPath({ slug: areaSlug })}>
    <span dir="auto">{areaLinkLabel(areaName)}</span>
    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
))`
  ${styles.AreaLink}
`;
