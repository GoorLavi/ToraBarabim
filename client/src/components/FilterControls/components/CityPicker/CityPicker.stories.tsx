import type { CityAreaSuggestionGroup, CitySearchResult, CitySuggestionsResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';
import styled from 'styled-components';

import type { SelectedCity } from '~/hooks/models';
import { jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { RECENT_CITIES_STORAGE_KEY } from './consts';
import { CityPicker } from './CityPicker';

// This feature's own `installMockFetch`, not `~/storyMocks`'s: every other
// mocked story answers by URL alone, but this one also needs
// `suggestionsScenario` (module-level, set by the decorator before render)
// to tell two stories' requests to the same parameterless endpoint apart.
type SuggestionsScenario = 'loaded' | 'loading' | 'empty' | 'error';

// Read at fetch time, set by each story's own decorator before it renders:
// `GET /v1/cities/suggestions` takes no parameters, so there is nothing in
// the request itself to tell two different stories apart.
let suggestionsScenario: SuggestionsScenario = 'loaded';

const loadedAreas: CityAreaSuggestionGroup[] = [
  {
    area: 'telAviv',
    areaName: 'תל אביב והמרכז',
    slug: 'תל-אביב-והמרכז',
    areaLessonCount: 40,
    cities: [
      { id: '5000', name: 'תל אביב יפו', slug: 'תל-אביב-יפו', area: 'telAviv', lessonCount: 12 },
      { id: '5010', name: 'רמת גן', slug: 'רמת-גן', area: 'telAviv', lessonCount: 8 },
      { id: '5020', name: 'גבעתיים', slug: 'גבעתיים', area: 'telAviv', lessonCount: 6 },
      { id: '5030', name: 'בני ברק', slug: 'בני-ברק', area: 'telAviv', lessonCount: 5 },
      { id: '5040', name: 'חולון', slug: 'חולון', area: 'telAviv', lessonCount: 3 },
      { id: '5050', name: 'בת ים', slug: 'בת-ים', area: 'telAviv', lessonCount: 2 },
      { id: '5060', name: 'קריית אונו', slug: 'קריית-אונו', area: 'telAviv', lessonCount: 2 },
      { id: '5070', name: 'אור יהודה', slug: 'אור-יהודה', area: 'telAviv', lessonCount: 1 },
      { id: '5080', name: 'יהוד מונוסון', slug: 'יהוד-מונוסון', area: 'telAviv', lessonCount: 1 },
    ],
  },
  {
    area: 'sharon',
    areaName: 'השרון',
    slug: 'השרון',
    areaLessonCount: 6,
    cities: [
      { id: '4200', name: 'רעננה', slug: 'רעננה', area: 'sharon', lessonCount: 3 },
      { id: '4210', name: 'כפר סבא', slug: 'כפר-סבא', area: 'sharon', lessonCount: 2 },
      { id: '4220', name: 'הוד השרון', slug: 'הוד-השרון', area: 'sharon', lessonCount: 1 },
    ],
  },
  {
    area: 'north',
    areaName: 'הצפון',
    slug: 'הצפון',
    areaLessonCount: 1,
    cities: [{ id: '2000', name: 'טבריה', slug: 'טבריה', area: 'north', lessonCount: 1 }],
  },
];

const loadedSuggestions: CitySuggestionsResponse = { areas: loadedAreas };

const installMockFetch = (): void => {
  const previousFetch = window.fetch;
  window.fetch = (async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString(), window.location.origin);

    if (url.pathname === '/v1/cities/suggestions') {
      if (suggestionsScenario === 'loading') return NEVER_RESOLVES;
      if (suggestionsScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
      if (suggestionsScenario === 'empty') return jsonResponse(200, { areas: [] } satisfies CitySuggestionsResponse);
      return jsonResponse(200, loadedSuggestions);
    }

    if (url.pathname === '/v1/cities') {
      const q = url.searchParams.get('q') ?? '';
      if (q === 'חי') {
        const items: CitySearchResult[] = [
          { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', areaName: 'חיפה והקריות', lessonCount: 6 },
          { id: '5090', name: 'חיפה עילית', slug: 'חיפה-עילית', area: 'haifa', areaName: 'חיפה והקריות', lessonCount: 0 },
        ];
        return jsonResponse(200, { items });
      }
      return jsonResponse(200, { items: [] });
    }

    return previousFetch(input, init);
  }) as typeof fetch;
};

installMockFetch();

// One stable `QueryClient` per story mount, isolated from the shared one in
// `.storybook/preview.tsx` and from every other story: `suggestionsScenario`
// only takes effect on an actual fetch, and a query key TanStack Query
// already has cached from a previous story would otherwise skip the fetch
// entirely and show that story's data instead.
//
// `retry: false` for the reason `.storybook/preview.tsx` already gives for
// its own shared client: the default three retries with backoff make an
// error-state story hang instead of showing its error. Only the isolation
// above is story-specific, not that choice.
const FreshQueryClientProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const withSuggestionsScenario = (scenario: SuggestionsScenario) => (Story: React.ComponentType) => {
  suggestionsScenario = scenario;
  return (
    <FreshQueryClientProvider>
      <Story />
    </FreshQueryClientProvider>
  );
};

// Seeded synchronously in the decorator body, same as `suggestionsScenario`
// above, so the value is already in `localStorage` the first time
// `useRecentCities`'s lazy `useState` initializer reads it on mount.
const withRecentCities = (cities: SelectedCity[]) => (Story: React.ComponentType) => {
  if (cities.length === 0) window.localStorage.removeItem(RECENT_CITIES_STORAGE_KEY);
  else window.localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(cities));
  return <Story />;
};

// The pill is white-on-transparent, meant for `FilterControls`'s own plum
// band, not Storybook's near-white canvas (mirrors DateFilterChips.stories).
const HeaderBand = styled.div(
  ({ theme }) => `
    background: ${theme.colors.primary};
    padding: ${theme.spacing.lg};
    min-block-size: 480px;
  `,
);

const noop = (): void => {};

const meta: Meta<typeof CityPicker> = {
  title: 'FilterControls/CityPicker',
  component: CityPicker,
  decorators: [
    (Story) => (
      <HeaderBand>
        <Story />
      </HeaderBand>
    ),
  ],
  args: {
    city: undefined,
    onSelectCity: noop,
    onClearCity: noop,
  },
};

export default meta;
type Story = StoryObj<typeof CityPicker>;

const openPicker = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'כל הארץ' }));
  return canvas;
};

// Recent cities, loaded suggestions: the panel's ordinary first look once
// someone has chosen a city before.
export const Open: Story = {
  decorators: [
    withSuggestionsScenario('loaded'),
    withRecentCities([
      { id: '5000', name: 'תל אביב יפו' },
      { id: '4200', name: 'רעננה' },
    ]),
  ],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('נבחרו לאחרונה')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('תל אביב והמרכז')).resolves.toBeInTheDocument();
  },
};

// No recent cities yet: the very first time anyone opens the panel, before
// `useRecentCities` has anything to show, so the whole recent block
// (including its own label) is absent.
export const FirstVisit: Story = {
  decorators: [withSuggestionsScenario('loaded'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('תל אביב והמרכז')).resolves.toBeInTheDocument();
    expect(canvas.queryByText('נבחרו לאחרונה')).not.toBeInTheDocument();
  },
};

// A typed query swaps the grouped list for the flat, ranked result list.
export const Typing: Story = {
  decorators: [withSuggestionsScenario('loaded'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'חיפוש עיר' }), 'חי');
    await expect(canvas.findByText('חיפה עילית')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('חיפה והקריות, אין עדיין שיעורים')).resolves.toBeInTheDocument();
  },
};

// The grouped list's three real states (build spec, "Grouped list, loading
// / empty / error"): the search list has its own equivalent triplet, not
// covered separately here.
export const GroupedLoading: Story = {
  decorators: [withSuggestionsScenario('loading'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    await openPicker(canvasElement);
  },
};

export const GroupedEmpty: Story = {
  decorators: [withSuggestionsScenario('empty'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('אין כרגע שיעורים באתר')).resolves.toBeInTheDocument();
  },
};

export const GroupedError: Story = {
  decorators: [withSuggestionsScenario('error'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('לא הצלחנו לטעון את רשימת הערים')).resolves.toBeInTheDocument();
  },
};

// The city-picker guard (docs in ResponsiveSheet.tsx): below `sm` the panel
// is `FilterDrawer`, `ResponsiveSheet`'s own portal, so this forces the
// iframe narrow rather than relying on whatever the runner's default width
// happens to be (mirrors DedicationBand.stories.tsx's own `frameElement`
// technique, the established way to cross a breakpoint in this suite).
const resizeFrameNarrow = async (): Promise<void> => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (!frame) throw new Error('CityPicker story: window.frameElement not found, expected to be running inside the test runner\'s iframe');
  frame.style.width = '375px';
  await new Promise((resolve) => window.setTimeout(resolve, 100));
};

// The guarantee the whole Tab-trap change exists not to break (the
// city-picker guard's own required test): picking a city inside the phone
// drawer still calls `onSelectCity` and still closes the drawer, the same
// Safari-mousedown-focus shape `CitySelect.stories.tsx`'s own equivalent
// story exists for.
export const PhoneWidthSelectsACityAndClosesTheDrawer: Story = {
  decorators: [withSuggestionsScenario('loaded'), withRecentCities([])],
  args: { onSelectCity: fn() },
  play: async ({ canvasElement, args }) => {
    await resizeFrameNarrow();
    const canvas = await openPicker(canvasElement);
    const body = within(document.body);

    await userEvent.type(await body.findByRole('textbox', { name: 'חיפוש עיר' }), 'חי');
    await userEvent.click(await body.findByText('חיפה עילית'));

    await expect(args.onSelectCity).toHaveBeenCalledWith({ id: '5090', name: 'חיפה עילית' });
    expect(body.queryByRole('dialog', { name: 'בחירת עיר' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

// Escape closes the drawer and returns focus to the pill: `ResponsiveSheet`'s
// own new Escape handling (option A), reaching `PanelFrame`'s Tab trap
// unbroken.
export const PhoneWidthEscapeClosesTheDrawer: Story = {
  decorators: [withSuggestionsScenario('loaded'), withRecentCities([])],
  play: async ({ canvasElement }) => {
    await resizeFrameNarrow();
    const canvas = await openPicker(canvasElement);
    await within(document.body).findByRole('dialog', { name: 'בחירת עיר' });

    await userEvent.keyboard('{Escape}');

    expect(within(document.body).queryByRole('dialog', { name: 'בחירת עיר' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'כל הארץ' })).toHaveFocus();
  },
};
