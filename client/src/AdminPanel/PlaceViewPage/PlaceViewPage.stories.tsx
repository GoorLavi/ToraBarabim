import type { AdminPlaceResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { PlaceViewPage } from './PlaceViewPage';

const placeResponse = (overrides: Partial<AdminPlaceResponse>): AdminPlaceResponse => ({
  id: 'story-populated',
  slug: 'story-populated',
  name: 'בית כנסת שלום',
  street: 'רחוב וייצמן 3',
  floor: 'קומה 2, דלת מימין למעלית',
  cityCode: 4000,
  cityName: 'חיפה',
  area: 'haifa',
  photoUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="lightgray"/></svg>'),
  isActive: true,
  ...overrides,
});

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/places/story-populated') return jsonResponse(200, placeResponse({}));
  if (url.pathname === '/v1/admin/places/story-nophoto') return jsonResponse(200, placeResponse({ id: 'story-nophoto', photoUrl: undefined, floor: undefined }));
  if (url.pathname === '/v1/admin/places/story-inactive') return jsonResponse(200, placeResponse({ id: 'story-inactive', isActive: false, photoUrl: undefined }));
  if (url.pathname === '/v1/admin/places/story-longname') {
    return jsonResponse(
      200,
      placeResponse({
        id: 'story-longname',
        name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
        street: 'שדרות ירושלים הבירה הנצחית של עם ישראל 128',
        cityName: 'קרית מלאכי',
        photoUrl: undefined,
      }),
    );
  }
  if (url.pathname === '/v1/admin/places/story-notfound') return jsonResponse(404, { error: 'not_found', message: 'לא נמצא' });
  if (url.pathname === '/v1/admin/places/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/places/story-loading') return NEVER_RESOLVES;
  return null;
});

const withRoute = (id: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/admin/places/${id}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/places/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof PlaceViewPage> = {
  title: 'AdminPanel/PlaceViewPage',
  component: PlaceViewPage,
};

export default meta;
type Story = StoryObj<typeof PlaceViewPage>;

export const Populated: Story = { decorators: [withRoute('story-populated')] };
export const NoPhotoAndNoFloor: Story = { decorators: [withRoute('story-nophoto')] };
export const Inactive: Story = { decorators: [withRoute('story-inactive')] };
export const LongName: Story = { decorators: [withRoute('story-longname')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
export const Loading: Story = { decorators: [withRoute('story-loading')] };
