import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { LoginPage } from './LoginPage';

// No live API in Storybook's own preview server: every route this page
// calls is answered here instead. Chains onto whatever `window.fetch`
// already is, and installs/restores through `beforeEach` so the mock
// never leaks into a story outside this file.
const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const installMockFetch = (respond: (url: URL) => Response | Promise<Response> | null): (() => void) => {
  const previousFetch = window.fetch;
  window.fetch = (async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString(), window.location.origin);
    const result = respond(url);
    if (result) return result;
    return previousFetch(input, init);
  }) as typeof fetch;
  return () => {
    window.fetch = previousFetch;
  };
};

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
