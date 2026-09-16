import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import type { FilterDrawerProps } from './models';
import * as styles from './styles';

// The bottom-drawer shell both header pickers open below `sm`: CityPicker
// and AudienceFilter (useIsWideViewport.ts decides which). Neither owns
// this on its own; it lifted here, their nearest common ancestor, the
// moment a second caller needed it.
export const FilterDrawer = styled(({ className, ariaLabel, onDismiss, children }: FilterDrawerProps) => (
  <ResponsiveSheet className={className} {...{ ariaLabel, onDismiss }}>
    {children}
  </ResponsiveSheet>
))`
  ${styles.FilterDrawer}
`;
