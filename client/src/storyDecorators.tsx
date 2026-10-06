import type { Decorator } from '@storybook/react-vite';
import styled from 'styled-components';

import * as styles from './storyDecorators.styles';

const PanelShellContent = styled.div`
  ${styles.PanelShellContent}
`;

const PrimaryField = styled.div`
  ${styles.PrimaryField}
`;

export const primaryFieldDecorator: Decorator = (Story) => (
  <PrimaryField>
    <Story />
  </PrimaryField>
);

// For a panel or admin page story: supplies the container `PlaceShell` and
// `AdminShell` wrap every page in, so `layout: 'fullscreen'` (needed to
// cancel Storybook's own 16px frame gutter) does not also strip the gutter
// the real shell would have supplied.
export const panelShellDecorator: Decorator = (Story) => (
  <PanelShellContent>
    <Story />
  </PanelShellContent>
);
