import type { AdminDedication } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { DedicationsListPage } from './DedicationsListPage';

const NBSP = ' ';

// A full `AdminDedication`, matching the shape `toAdminDedication`
// (server/src/convertors/admin-dedication.ts) sends: `display` is the same
// composed segments a visitor would see, never rebuilt here from the raw
// fields.
const adminDedication = (overrides: Partial<AdminDedication>): AdminDedication => ({
  id: 'dedication-1',
  type: 'memorial',
  honoredName: 'חנה דבורה',
  honorific: 'ah',
  honoredGender: 'female',
  parentName: 'אברהם',
  donorFamilyName: 'לוי',
  closingLineEnabled: true,
  startsOn: '2026-09-01',
  endsOn: '2026-12-01',
  state: 'live',
  display: {
    formulaLine: `לעילוי${NBSP}נשמת`,
    nameLine: `חנה דבורה${NBSP}ע״ה`,
    parentLine: `בת${NBSP}אברהם`,
    closingLine: 'תנצב״ה',
    donorCreditLine: `תרומת משפחת${NBSP}לוי`,
  },
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  ...overrides,
});

const populatedItems: AdminDedication[] = [
  adminDedication({ id: 'd-1' }),
  adminDedication({
    id: 'd-2',
    type: 'healing',
    honoredName: 'משה כהן',
    honorific: undefined,
    honoredGender: 'male',
    donorFamilyName: undefined,
    closingLineEnabled: false,
    state: 'upcoming',
    startsOn: '2026-12-01',
    endsOn: '2027-01-01',
    display: { formulaLine: `לרפואה${NBSP}שלמה${NBSP}של${NBSP}`, nameLine: `משה כהן`, parentLine: `בן${NBSP}אברהם` },
  }),
  adminDedication({
    id: 'd-3',
    type: 'success',
    honoredName: 'יוסף לוי',
    honorific: undefined,
    parentName: 'דוד',
    donorFamilyName: undefined,
    closingLineEnabled: false,
    state: 'ended',
    startsOn: '2026-01-01',
    endsOn: '2026-06-01',
    display: { formulaLine: 'להצלחת', nameLine: `יוסף לוי`, parentLine: `בן${NBSP}דוד` },
  }),
  adminDedication({ id: 'd-4', state: 'takenDown', takenDownReason: 'בקשת המשפחה' }),
];

type Scenario = 'populated' | 'empty' | 'loading' | 'error';
let scenario: Scenario = 'populated';

// Set only while a story from this file is actually mounted, the same
// guard `RabbisListPage.stories.tsx` uses at its own identical mock: a
// `loading` scenario's request never resolves, so without this a later
// story's teardown would let that stale promise land against DOM that
// isn't there anymore.
let activeStoryToken: symbol | null = null;

installMockFetch((url) => {
  if (activeStoryToken === null) return null;
  if (url.pathname !== '/v1/admin/dedications') return null;
  if (scenario === 'loading') return NEVER_RESOLVES;
  if (scenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (scenario === 'empty') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
  return jsonResponse(200, { items: populatedItems, page: 1, pageSize: 50, total: populatedItems.length });
});

// Mounts a query client of its own, isolated from the shared one in
// `.storybook/preview.tsx`: every scenario here asks the same query key, so
// a warm cache from the story before would go on serving it without a
// fetch, and `Empty`'s own assertion would silently check whichever story
// happened to run first (mirrors RabbisListPage.stories.tsx's own
// `StoryScope`, for the same reason). The token is claimed during render,
// not in an effect: a child's effect runs before its parent's, so the
// page's first request would already be out by the time an effect here
// could have claimed it.
const StoryScope = ({ children }: { children: ReactNode }): ReactNode => {
  const [token] = useState(() => Symbol('DedicationsListPage story'));
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  activeStoryToken = token;

  useEffect(
    () => () => {
      if (activeStoryToken === token) activeStoryToken = null;
    },
    [token],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const withScenario = (next: Scenario) => (Story: React.ComponentType) => {
  scenario = next;
  return (
    <StoryScope>
      <Story />
    </StoryScope>
  );
};

const meta: Meta<typeof DedicationsListPage> = {
  title: 'AdminPanel/DedicationsListPage',
  component: DedicationsListPage,
};

export default meta;
type Story = StoryObj<typeof DedicationsListPage>;

export const Populated: Story = { decorators: [withScenario('populated')] };

// One primary button, not two: the header's own "add" button and the empty
// state's "add the first one" button did the same job and read as the same
// pill, side by side on the same screen (design gate finding).
export const Empty: Story = {
  decorators: [withScenario('empty')],
  play: async ({ canvasElement }) => {
    const primaryLinks = Array.from(canvasElement.querySelectorAll('a.add, a.cta'));
    expect(primaryLinks.length).toEqual(1);
  },
};
export const Loading: Story = { decorators: [withScenario('loading')] };
export const ServerError: Story = { decorators: [withScenario('error')] };
