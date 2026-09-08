import styled from 'styled-components';

import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';

import * as consts from './consts';
import type { RouteNotFoundPageProps } from './models';
import * as styles from './styles';

export const RouteNotFoundPage = styled(({ className }: RouteNotFoundPageProps) => (
  <div className={className}>
    <NotFoundScreen
      heading={consts.ROUTE_NOT_FOUND_HEADING}
      explanation={consts.ROUTE_NOT_FOUND_EXPLANATION}
      actionLabel={consts.BACK_TO_HOME_LABEL}
      actionTo="/"
    />
  </div>
))`
  ${styles.RouteNotFoundPage}
`;
