import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import * as consts from './consts';
import { PlacePicker } from './PlacePicker';
import { placeFixture } from './placeFixture';

const ohelYitzhak = placeFixture({ id: 'p1', name: 'בית הכנסת המרכזי אהל יצחק ומאיר', street: 'רחוב הרב קוק 8', city: 'בני ברק', citySlug: 'בני-ברק' });
const shulShalom = placeFixture({ id: 'p2', name: 'בית כנסת שלום', street: 'רחוב וייצמן 3', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' });

// `usePlaceSearch` fetches the whole list once, unconditionally, so
// `placesScenario`, read at fetch time and set by each story's own
// decorator before it renders, is what tells the picker control's loading
// and error states apart from its ordinary populated one, since they all
// hit the same URL. Mirrors `CitySelect.stories.tsx`'s own `citiesScenario`.
type PlacesScenario = 'loaded' | 'loading' | 'error';

let placesScenario: PlacesScenario = 'loaded';

installMockFetch((url) => {
  if (url.pathname === '/v1/places') {
    if (placesScenario === 'loading') return NEVER_RESOLVES;
    if (placesScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    return jsonResponse(200, { items: [ohelYitzhak, shulShalom] });
  }
  if (url.pathname === '/v1/places/similar') {
    const name = url.searchParams.get('name');
    if (name === 'אהל') return jsonResponse(200, { items: [ohelYitzhak] });
    return jsonResponse(200, { items: [] });
  }
  return null;
});

const withPlacesScenario = (scenario: PlacesScenario) => (Story: React.ComponentType) => {
  placesScenario = scenario;
  return <Story />;
};

// A fresh, isolated `QueryClient` per story (`retry: false`, same reason
// `.storybook/preview.tsx` gives its own shared one): `usePlaceSearch`'s
// query key never varies with the query text (it fetches the whole list
// eagerly, unfiltered, and filters client-side), so the shared client would
// answer every story after the first from its own cache regardless of
// `placesScenario`. Applied to every story here, not only the two that vary
// the scenario, so none of them can leak a cached place list into another.
const FreshQueryClientProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const withFreshQueryClient = (Story: React.ComponentType) => (
  <FreshQueryClientProvider>
    <Story />
  </FreshQueryClientProvider>
);

const meta: Meta<typeof PlacePicker> = {
  title: 'components/PlacePicker',
  component: PlacePicker,
  decorators: [withFreshQueryClient],
  args: {
    city: { id: '5000', name: 'בני ברק' },
    onSelectCity: () => {},
    onChangeVenue: () => {},
    cityError: undefined,
    nameError: undefined,
    streetError: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof PlacePicker>;

// State A: nothing chosen. The picker, the quiet `או` fork, and the open
// address fields beneath it.
export const NothingChosen: Story = {
  args: { venue: { kind: 'address', name: '', street: '', floor: '' } },
};

// State A with the duplicate hint showing, once a city is chosen and a
// name matching a registered place has settled.
export const DuplicateHintShowing: Story = {
  args: { venue: { kind: 'address', name: 'אהל', street: '', floor: '' } },
};

// State B: an active place chosen. The control shows its two lines, the
// cancel link sits below it, and the locked fields read from the place.
export const PlaceChosen: Story = {
  args: { venue: { kind: 'place', place: ohelYitzhak } },
};

// State C: an already-saved lesson whose place was later deactivated. The
// control tags it `לא פעיל` beside the clear affordance; the lesson keeps
// the place's last-known address. See the slice's report: the live server
// never actually produces this combination today (a deactivated place
// resolves to a free-text address on read, per
// `server/src/service/shared/address.ts`'s `toVenuePanel`), so this state
// is demonstrated here defensively, from mock data only.
export const InactivePlaceOnSavedLesson: Story = {
  args: { venue: { kind: 'place', place: { ...ohelYitzhak, isActive: false } } },
};

// A long place name, a long street name and a long city, the layout must
// survive per design-system.md.
export const LongNames: Story = {
  args: {
    venue: {
      kind: 'place',
      place: placeFixture({
        id: 'p3',
        name: 'בית הכנסת המרכזי אהל יצחק ומאיר על שם הרב עובדיה יוסף זצ"ל',
        street: 'שדרות ירושלים הבירה הנצחית של עם ישראל 128',
        city: 'קרית מלאכי',
      }),
    },
  },
};

// Field-level validation errors on the free-text address fields.
export const WithErrors: Story = {
  args: {
    venue: { kind: 'address', name: '', street: '', floor: '' },
    city: undefined,
    cityError: 'יש לבחור עיר',
    nameError: 'יש למלא את שם בית הכנסת או המוסד',
    streetError: 'יש למלא רחוב ומספר',
  },
};

const openPicker = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: consts.PICKER_PLACEHOLDER }));
  return canvas;
};

export const PickerLoading: Story = {
  decorators: [withPlacesScenario('loading')],
  args: { venue: { kind: 'address', name: '', street: '', floor: '' } },
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText(consts.PICKER_SEARCH_LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const PickerLoadError: Story = {
  decorators: [withPlacesScenario('error')],
  args: { venue: { kind: 'address', name: '', street: '', floor: '' } },
  play: async ({ canvasElement }) => {
    const canvas = await openPicker(canvasElement);
    await expect(canvas.findByText(consts.PICKER_SEARCH_LOAD_ERROR_MESSAGE)).resolves.toBeInTheDocument();
  },
};
