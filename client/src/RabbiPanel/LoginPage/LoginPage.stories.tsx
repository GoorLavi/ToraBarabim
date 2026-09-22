import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { errorResolver, http } from '../../../.storybook/apiMocks';
import { LoginPage } from './LoginPage';

const meta: Meta<typeof LoginPage> = {
  title: 'RabbiPanel/LoginPage',
  component: LoginPage,
  parameters: {
    apiMocks: {
      handlers: {
        // Not logged in, so the login form renders instead of redirecting.
        session: http.get('/v1/rabbi/me', errorResolver(401, 'unauthenticated', 'לא מחובר')),
        login: http.post('/v1/rabbi/login', errorResolver(401, 'invalid_credentials', 'אימייל, שם משתמש או סיסמה שגויים')),
      },
    },
  },
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
