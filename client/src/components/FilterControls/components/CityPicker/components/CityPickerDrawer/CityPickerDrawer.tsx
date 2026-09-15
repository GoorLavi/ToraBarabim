import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import type { CityPickerDrawerProps } from './models';
import * as styles from './styles';

export const CityPickerDrawer = styled(({ className, ariaLabel, onDismiss, children }: CityPickerDrawerProps) => (
  <ResponsiveSheet className={className} {...{ ariaLabel, onDismiss }}>
    {children}
  </ResponsiveSheet>
))`
  ${styles.CityPickerDrawer}
`;
