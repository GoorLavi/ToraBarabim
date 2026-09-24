import type { Meta, StoryObj } from '@storybook/react-vite';

import { RouteNotFoundPage } from './RouteNotFoundPage';

// No network call on this page, so there is only one state.
const meta: Meta<typeof RouteNotFoundPage> = {
  title: 'App/RouteNotFoundPage',
  component: RouteNotFoundPage,
};

export default meta;
type Story = StoryObj<typeof RouteNotFoundPage>;

export const Default: Story = {};
