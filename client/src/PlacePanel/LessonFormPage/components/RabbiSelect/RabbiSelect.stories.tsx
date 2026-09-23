import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RabbiDirectoryEntry } from '@torabarabim/common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import * as consts from './consts';
import { RabbiSelect } from './RabbiSelect';

// Both audience scopes are fetched eagerly on mount (`useRabbiSearch`), so
// a rabbanit stays reachable through the women's scope even with an empty
// query. `rabbisScenario`, read at fetch time and set by each story's own
// decorator before it renders, is what tells the loading, empty and
// populated stories apart. Mirrors `CitySelect.stories.tsx`'s own
// `citiesScenario`.
type RabbisScenario = 'loaded' | 'loading' | 'error';

let rabbisScenario: RabbisScenario = 'loaded';

const yaakov: RabbiDirectoryEntry = { ...rabbiFixture({ id: 'rabbi-1', name: 'יעקב שפירא' }), lessonCount: 2, cities: [] };
const sara: RabbiDirectoryEntry = { ...rabbiFixture({ id: 'rabbi-2', name: 'שרה כהן', honorific: 'rabbanit' }), lessonCount: 1, cities: [] };

installMockFetch((url) => {
  if (url.pathname !== '/v1/rabbis') return null;
  if (rabbisScenario === 'loading') return NEVER_RESOLVES;
  if (rabbisScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  const scope = url.searchParams.get('scope');
  const items = scope === 'women' ? [sara] : [yaakov];
  return jsonResponse(200, { items, page: 1, pageSize: 50, total: items.length });
});

// A fresh, isolated `QueryClient` per story (`retry: false`, same reason
// `.storybook/preview.tsx` gives its own shared one): this control's query
// key never varies with the query text (it fetches both scopes eagerly,
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

const meta: Meta<typeof RabbiSelect> = {
  title: 'PlacePanel/LessonFormPage/RabbiSelect',
  component: RabbiSelect,
  args: {
    rabbi: undefined,
    onSelectRabbi: fn(),
    errorMessage: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof RabbiSelect>;

const openSelect = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: consts.RABBI_SELECT_PLACEHOLDER }));
  return canvas;
};

export const NothingChosen: Story = {
  decorators: [withRabbisScenario('loaded')],
};

export const WithFieldError: Story = {
  decorators: [withRabbisScenario('loaded')],
  args: { errorMessage: 'יש לבחור רב או רבנית' },
};

export const Loading: Story = {
  decorators: [withRabbisScenario('loading')],
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(consts.RABBI_SEARCH_LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const LoadError: Story = {
  decorators: [withRabbisScenario('error')],
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(consts.RABBI_SEARCH_LOAD_ERROR_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const OpenWithResults: Story = {
  decorators: [withRabbisScenario('loaded')],
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText('הרב יעקב שפירא')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('הרבנית שרה כהן')).resolves.toBeInTheDocument();
  },
};
