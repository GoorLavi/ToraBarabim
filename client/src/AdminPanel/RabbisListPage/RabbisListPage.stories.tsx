import type { RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';

import { MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';
import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import * as consts from './consts';
import { RabbisListPage } from './RabbisListPage';

type Scenario = 'loaded' | 'loading' | 'error';

// Read at fetch time, set by each story's decorator before it renders: the
// list request carries nothing that would tell two stories apart.
let scenario: Scenario = 'loaded';

// Counted rather than asserted per call: the debounce story's claim is about
// how many times the list was asked, not what it answered.
let rabbiRequestCount = 0;

// Which story of this file, if any, is on screen. `.storybook/preview.tsx`
// chains every story file's mock onto one `window.fetch`, so without this
// the answers below would also be given for other screens in the same
// session: `/v1/admin/lessons` is answered empty here, which is true of this
// page (it only counts them) and would empty out `LessonsListPage` and
// `RabbiViewPage`, and a visit to the loading or error story would leave
// `scenario` set for whatever is opened next. A token rather than a boolean,
// because a story that mounts before the previous one unmounts would
// otherwise have its own flag cleared by that unmount.
let activeStoryToken: symbol | null = null;

const MATCHES_NOTHING = 'זזז';

const rabbi = (overrides: Partial<RabbiResponse> & Pick<RabbiResponse, 'id' | 'name'>): RabbiResponse => ({
  ...rabbiFixture(overrides),
  prominence: 'known',
  ...overrides,
});

// The last four are `LessonsListPage.stories.tsx`'s and
// `LessonFormPage.stories.tsx`'s rabbis, carried here for the reason both of
// those files already give at their own lists: all three hit the same
// unfiltered `/v1/admin/rabbis?page=1&pageSize=50` request, and whichever
// file's mock loaded last answers for all of them. This file's own three are
// named so that no name repeats across the combined list, or a query by name
// would match two cards once one of the other files is the answering mock.
// Most carry a photo and one does not, because that is the mix the real
// product has (docs/product.md): a list where every card fell back would
// leave the fallback as the only state the design gate ever sees.
const rabbis: RabbiResponse[] = [
  rabbi({ id: 'r1', name: 'אליהו בן שמעון', title: 'ראש ישיבה' }),
  rabbi({ id: 'r2', name: 'שרה גולדברג', honorific: 'rabbanit', title: 'רבנית הקהילה' }),
  rabbi({ id: 'r3', name: 'יוסף חיים אזולאי', photoUrl: undefined }),
  rabbi({ id: 'rabbi-1', name: 'אברהם כהן' }),
  rabbi({ id: 'rabbi-2', name: 'משה לוי' }),
  rabbi({ id: 'rabbi-3', name: 'נתן צבי אשכנזי הכהן' }),
  rabbi({ id: 'story-edit-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה' }),
];

// Same body shape as the other two files that answer this route, so that
// whichever mock wins the chain hands every screen the same thing.
const listBody = (items: RabbiResponse[]) => ({ items, total: items.length, page: 1, pageSize: MAX_ADMIN_PAGE_SIZE });

installMockFetch((url) => {
  if (activeStoryToken === null) return null;

  if (url.pathname === '/v1/admin/rabbis') {
    rabbiRequestCount += 1;
    if (scenario === 'loading') return NEVER_RESOLVES;
    if (scenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    if (url.searchParams.get('q') === MATCHES_NOTHING) return jsonResponse(200, listBody([]));
    return jsonResponse(200, listBody(rabbis));
  }
  if (url.pathname === '/v1/admin/lessons') return jsonResponse(200, { items: [], total: 0, page: 1, pageSize: MAX_ADMIN_PAGE_SIZE });
  return null;
});

// Claims the mock for this file and mounts a query client of its own,
// isolated from the shared one in `.storybook/preview.tsx`: every story here
// asks the same two query keys, so a warm cache from the story before would
// serve them without a fetch and the request count this file asserts on
// would be counting the order stories happened to run in. `retry: false` for
// the reason that same file already gives for its own client.
//
// The token is claimed during render, not in an effect: a child's effect
// runs before its parent's, so the page's first request would already be out
// by the time an effect here could have claimed it.
const StoryScope = ({ children }: { children: ReactNode }): ReactNode => {
  const [token] = useState(() => Symbol('RabbisListPage story'));
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

// No `args` on any story in this file: an arg the designer moves in
// Storybook re-renders the decorator, which would reset the counter under
// the story that asserts on it.
const withScenario = (next: Scenario) => (Story: React.ComponentType) => {
  scenario = next;
  rabbiRequestCount = 0;
  return (
    <StoryScope>
      <Story />
    </StoryScope>
  );
};

const meta: Meta<typeof RabbisListPage> = {
  title: 'AdminPanel/RabbisListPage',
  component: RabbisListPage,
  decorators: [withScenario('loaded')],
};

export default meta;
type Story = StoryObj<typeof RabbisListPage>;

const searchField = (canvasElement: HTMLElement): HTMLInputElement =>
  within(canvasElement).getByRole('searchbox', { name: consts.SEARCH_LABEL }) as HTMLInputElement;

export const Loaded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('הרב אליהו בן שמעון')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('הרבנית שרה גולדברג')).resolves.toBeInTheDocument();
  },
};

export const Loading: Story = {
  decorators: [withScenario('loading')],
};

export const Failed: Story = {
  decorators: [withScenario('error')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.findByRole('button', { name: consts.RETRY_LABEL })).resolves.toBeInTheDocument();
  },
};

// Clearing a search that matched nothing used to flash "there are no rabbis
// yet", with its add-the-first-rabbi call to action, over a system full of
// them: the empty state read the live search term while the rows still
// answered the previous one. The assertion runs in the same flush as the
// click, which is the whole window the wrong state was visible in.
export const ClearingASearchNeverOffersTheFirstRabbi: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('הרב אליהו בן שמעון')).resolves.toBeInTheDocument();

    await userEvent.type(searchField(canvasElement), MATCHES_NOTHING);
    await expect(canvas.findByText(consts.NO_MATCHING_RABBIS_HEADLINE)).resolves.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: consts.CLEAR_SEARCH_LABEL }));
    expect(canvas.queryByText(consts.NO_RABBIS_HEADLINE)).not.toBeInTheDocument();

    await expect(canvas.findByText('הרב אליהו בן שמעון')).resolves.toBeInTheDocument();
  },
};

// Typing a name used to send one request per character. The count is read
// once the search has settled, so it covers the whole burst: the first
// request is the unfiltered list this page loads with, the second is the
// typed term.
export const TypingSendsOneRequest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('הרב אליהו בן שמעון')).resolves.toBeInTheDocument();
    expect(rabbiRequestCount).toBe(1);

    await userEvent.type(searchField(canvasElement), MATCHES_NOTHING);
    await expect(canvas.findByText(consts.NO_MATCHING_RABBIS_HEADLINE)).resolves.toBeInTheDocument();
    expect(rabbiRequestCount).toBe(2);
  },
};
