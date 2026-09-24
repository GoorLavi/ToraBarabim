import type { CityAreaSuggestionGroup, CitySearchResult, CitySuggestionsResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';
import styled from 'styled-components';

import type { SelectedCity } from '~/hooks/models';

import { errorResolver, http, jsonResolver, loadingResolver, queryOf, respondWithJson } from '../../../../../.storybook/apiMocks';
import type { MockResolver } from '../../../../../.storybook/apiMocks';
import { RECENT_CITIES_STORAGE_KEY } from './consts';
import { CityPicker } from './CityPicker';

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

const suggestionsHandler = (resolver: MockResolver) => http.get('/v1/cities/suggestions', resolver);

// A typed 'חי' returns the flat, ranked search list; any other query, none.
const searchResults: CitySearchResult[] = [
  { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', areaName: 'חיפה והקריות', lessonCount: 6 },
  { id: '5090', name: 'חיפה עילית', slug: 'חיפה-עילית', area: 'haifa', areaName: 'חיפה והקריות', lessonCount: 0 },
];

const citiesSearchHandler = http.get('/v1/cities', ({ request }) =>
  respondWithJson({ items: queryOf(request).get('q') === 'חי' ? searchResults : [] }),
);

// Seeded synchronously in the decorator body, so the value is already in
// `localStorage` the first time `useRecentCities`'s lazy `useState`
// initializer reads it on mount.
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
  parameters: { apiMocks: { handlers: { suggestions: suggestionsHandler(jsonResolver(loadedSuggestions)), cities: citiesSearchHandler } } },
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

// Below `sm` the panel is a sheet portalled to the document body, outside the
// canvas, so everything after the click is queried from the body: that finds
// the panel at both the mobile and the desktop viewport.
const openPicker = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'כל הארץ' }));
  return within(document.body);
};

// Recent cities, loaded suggestions: the panel's ordinary first look once
// someone has chosen a city before.
export const Open: Story = {
  decorators: [
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
  decorators: [withRecentCities([])],
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('תל אביב והמרכז')).resolves.toBeInTheDocument();
    expect(canvas.queryByText('נבחרו לאחרונה')).not.toBeInTheDocument();
  },
};

// A typed query swaps the grouped list for the flat, ranked result list.
export const Typing: Story = {
  decorators: [withRecentCities([])],
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
  decorators: [withRecentCities([])],
  parameters: { apiMocks: { handlers: { suggestions: suggestionsHandler(loadingResolver) } } },
  play: async ({ canvasElement }) => {
    await openPicker(canvasElement);
  },
};

export const GroupedEmpty: Story = {
  decorators: [withRecentCities([])],
  parameters: { apiMocks: { handlers: { suggestions: suggestionsHandler(jsonResolver({ areas: [] } satisfies CitySuggestionsResponse)) } } },
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('אין כרגע שיעורים באתר')).resolves.toBeInTheDocument();
  },
};

export const GroupedError: Story = {
  decorators: [withRecentCities([])],
  parameters: { apiMocks: { handlers: { suggestions: suggestionsHandler(errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText('לא הצלחנו לטעון את רשימת הערים')).resolves.toBeInTheDocument();
  },
};

// Below `sm` the panel is `FilterDrawer`, `ResponsiveSheet`'s own portal, so
// this forces the iframe narrow rather than relying on the runner's default
// width, then restores it.
const atNarrowWidth = async (play: () => Promise<void>): Promise<void> => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (!frame) throw new Error('CityPicker story: window.frameElement not found, expected to be running inside the test runner\'s iframe');
  const originalWidth = frame.style.width;
  frame.style.width = '375px';
  await new Promise((resolve) => window.setTimeout(resolve, 100));
  try {
    await play();
  } finally {
    frame.style.width = originalWidth;
  }
};

// The guarantee the whole Tab-trap change exists not to break: picking a
// city inside the phone drawer still calls `onSelectCity` and still closes
// the drawer, the same Safari-mousedown-focus shape `CitySelect.stories.tsx`'s
// own equivalent story exists for.
export const PhoneWidthSelectsACityAndClosesTheDrawer: Story = {
  decorators: [withRecentCities([])],
  args: { onSelectCity: fn() },
  play: ({ canvasElement, args }) =>
    atNarrowWidth(async () => {
      const canvas = await openPicker(canvasElement);
      const body = within(document.body);

      await userEvent.type(await body.findByRole('textbox', { name: 'חיפוש עיר' }), 'חי');
      await userEvent.click(await body.findByText('חיפה עילית'));

      await expect(args.onSelectCity).toHaveBeenCalledWith({ id: '5090', name: 'חיפה עילית' });
      expect(body.queryByRole('dialog', { name: 'בחירת עיר' })).not.toBeInTheDocument();
      expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    }),
};

// Escape closes the drawer and returns focus to the pill: `PanelFrame`'s own
// Escape handler is the closer ancestor here (nested inside `.panel`), so it
// acts first, and its own `onClose` is what returns focus.
export const PhoneWidthEscapeClosesTheDrawer: Story = {
  decorators: [withRecentCities([])],
  play: ({ canvasElement }) =>
    atNarrowWidth(async () => {
      const canvas = await openPicker(canvasElement);
      await within(document.body).findByRole('dialog', { name: 'בחירת עיר' });

      await userEvent.keyboard('{Escape}');

      expect(within(document.body).queryByRole('dialog', { name: 'בחירת עיר' })).not.toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'כל הארץ' })).toHaveFocus();
    }),
};
