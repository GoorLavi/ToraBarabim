import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';

import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';
import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import * as consts from './consts';
import { RabbiPicker } from './RabbiPicker';

// This control fetches its whole rabbi list eagerly, on mount, regardless
// of whether its own popover is open (no `hint`, unlike `CitySelect`'s
// gated search): `rabbisScenario`, read at fetch time and set by each
// story's own decorator before it renders, is what tells the loading,
// empty and populated stories apart, since they all hit the same URL.
// Mirrors `CitySelect.stories.tsx`'s own `citiesScenario`.
type RabbisScenario = 'loaded' | 'loading' | 'error';

let rabbisScenario: RabbisScenario = 'loaded';

const avraham = rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' });
const moshe = rabbiFixture({ id: 'rabbi-2', name: 'משה לוי' });

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/rabbis') {
    if (rabbisScenario === 'loading') return NEVER_RESOLVES;
    if (rabbisScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    return jsonResponse(200, { items: [avraham, moshe], page: 1, pageSize: 50, total: 2 });
  }
  if (url.pathname === '/v1/admin/lessons') return jsonResponse(200, { items: [], page: 1, pageSize: 1, total: 0 });
  return null;
});

// A fresh, isolated `QueryClient` per story (`retry: false`, same reason
// `.storybook/preview.tsx` gives its own shared one): this control's query
// key never varies with the query text (it fetches the whole list eagerly,
// unfiltered), so the shared client would answer every story after the
// first from its own cache regardless of `rabbisScenario`.
const FreshQueryClientProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const withRabbisScenario = (scenario: RabbisScenario) => (Story: React.ComponentType) => {
  rabbisScenario = scenario;
  return (
    <FreshQueryClientProvider>
      <Story />
    </FreshQueryClientProvider>
  );
};

const meta: Meta<typeof RabbiPicker> = {
  title: 'AdminPanel/LessonFormPage/RabbiPicker',
  component: RabbiPicker,
  args: {
    rabbi: undefined,
    onSelectRabbi: fn(),
    errorMessage: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof RabbiPicker>;

const openPicker = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: parentConsts.RABBI_SEARCH_PLACEHOLDER }));
  return canvas;
};

export const NothingChosen: Story = {
  decorators: [withRabbisScenario('loaded')],
};

export const WithFieldError: Story = {
  decorators: [withRabbisScenario('loaded')],
  args: { errorMessage: parentConsts.REQUIRED_RABBI_ERROR },
};

export const Loading: Story = {
  decorators: [withRabbisScenario('loading')],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText(consts.RABBI_SEARCH_LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const LoadError: Story = {
  decorators: [withRabbisScenario('error')],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText(consts.RABBI_SEARCH_LOAD_ERROR_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const OpenWithResults: Story = {
  decorators: [withRabbisScenario('loaded')],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('הרב אברהם כהן')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('הרב משה לוי')).resolves.toBeInTheDocument();
  },
};
