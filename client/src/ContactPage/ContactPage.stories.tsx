import type { Meta, StoryObj } from '@storybook/react-vite';

import { ContactPage } from './ContactPage';

// No network call on this page (ContactPage.tsx), so there is only one state.
const meta: Meta<typeof ContactPage> = {
  title: 'ContactPage/ContactPage',
  component: ContactPage,
};

export default meta;
type Story = StoryObj<typeof ContactPage>;

export const Default: Story = {};
