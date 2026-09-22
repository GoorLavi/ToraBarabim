import type { Meta, StoryObj } from '@storybook/react-vite';

import { installMockFetch, jsonResponse } from '~/storyMocks';

import { PlacePicker } from './PlacePicker';
import { placeFixture } from './placeFixture';

const ohelYitzhak = placeFixture({ id: 'p1', name: 'בית הכנסת המרכזי אהל יצחק ומאיר', street: 'רחוב הרב קוק 8', city: 'בני ברק', citySlug: 'בני-ברק' });
const shulShalom = placeFixture({ id: 'p2', name: 'בית כנסת שלום', street: 'רחוב וייצמן 3', city: 'חיפה', citySlug: 'חיפה', area: 'haifa' });

installMockFetch((url) => {
  if (url.pathname === '/v1/places') return jsonResponse(200, { items: [ohelYitzhak, shulShalom] });
  if (url.pathname === '/v1/places/similar') {
    const name = url.searchParams.get('name');
    if (name === 'אהל') return jsonResponse(200, { items: [ohelYitzhak] });
    return jsonResponse(200, { items: [] });
  }
  return null;
});

const meta: Meta<typeof PlacePicker> = {
  title: 'components/PlacePicker',
  component: PlacePicker,
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
