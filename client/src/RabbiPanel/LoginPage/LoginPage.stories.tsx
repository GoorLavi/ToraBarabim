import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { installMockFetch, jsonResponse } from '~/storyMocks';

import { LoginPage } from './LoginPage';

// Installs/restores through `beforeEach` so the mock never leaks into a
// story outside this file; see `~/storyMocks` for why every route this page
// calls has to be answered here at all.
const meta: Meta<typeof LoginPage> = {
  title: 'RabbiPanel/LoginPage',
  component: LoginPage,
  beforeEach: () =>
    installMockFetch((url) => {
      // Not logged in, so the login form renders instead of redirecting.
      if (url.pathname === '/v1/rabbi/me') return jsonResponse(401, { error: 'unauthenticated', message: 'לא מחובר' });
      if (url.pathname === '/v1/rabbi/login') {
        return jsonResponse(401, { error: 'invalid_credentials', message: 'אימייל, שם משתמש או סיסמה שגויים' });
      }
      return null;
    }),
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

export const LoginError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('אימייל או שם משתמש'), 'rabbi@example.com');
    await userEvent.type(canvas.getByLabelText('סיסמה'), 'wrong-password');
    await userEvent.click(canvas.getByRole('button', { name: 'כניסה' }));
    await canvas.findByRole('alert');
  },
};
