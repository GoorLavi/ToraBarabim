import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { RATE_LIMITED_ERROR } from '~/consts';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import * as consts from './consts';
import { PanelLogin } from './PanelLogin';

// Baseline mock for the one call this page makes; per-story `beforeEach`
// below overrides it for the states that need a specific server response.
// Installed/restored through `beforeEach` so it never leaks into a story
// outside this file (see `~/storyMocks` for why every route a page calls
// has to be answered here at all).
const meta: Meta<typeof PanelLogin> = {
  title: 'PanelLogin/PanelLogin',
  component: PanelLogin,
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/panel/login') return jsonResponse(401, { error: 'invalid_credentials', message: 'invalid' });
      return null;
    }),
};

export default meta;
type Story = StoryObj<typeof PanelLogin>;

const fillAndSubmit = async (canvasElement: HTMLElement): Promise<void> => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByLabelText(consts.IDENTIFIER_LABEL), 'user@example.com');
  await userEvent.type(canvas.getByLabelText(consts.PASSWORD_LABEL), 'a-password');
  await userEvent.click(canvas.getByRole('button', { name: consts.SUBMIT_LABEL }));
};

// idle: the untouched form, before any submission.
export const Idle: Story = {};

// submitting: the request never resolves, so the button stays in its
// pending state for the story to capture.
export const Submitting: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/panel/login') return NEVER_RESOLVES;
      return null;
    }),
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement);
    const canvas = within(canvasElement);
    await canvas.findByRole('button', { name: consts.SUBMIT_PENDING_LABEL });
  },
};

// invalid credentials: a wrong password, an unknown identifier, or an
// administrator's own credentials all answer with the same 401.
export const InvalidCredentials: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement);
    const canvas = within(canvasElement);
    await canvas.findByText(consts.INVALID_CREDENTIALS_ERROR);
  },
};

// deactivated: the account, or the place it belongs to, was turned off.
export const Deactivated: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/panel/login') return jsonResponse(403, { error: 'account_deactivated', message: 'deactivated' });
      return null;
    }),
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement);
    const canvas = within(canvasElement);
    await canvas.findByText(consts.DEACTIVATED_ERROR);
  },
};

// rate limited: too many attempts in the configured window.
export const RateLimited: Story = {
  beforeEach: () =>
    installMockFetch((url) => {
      if (url.pathname === '/v1/panel/login') return jsonResponse(429, { error: 'rate_limited', message: 'too many' });
      return null;
    }),
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement);
    const canvas = within(canvasElement);
    await canvas.findByText(RATE_LIMITED_ERROR);
  },
};
