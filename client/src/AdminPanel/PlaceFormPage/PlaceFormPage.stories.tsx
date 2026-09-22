import type { AdminPlaceResponse, PlaceAccountResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { PlaceFormPage } from './PlaceFormPage';

const place: AdminPlaceResponse = {
  id: 'story-editable-place',
  slug: 'story-editable-place',
  name: 'בית כנסת שלום',
  street: 'רחוב וייצמן 3',
  floor: 'קומה 2',
  cityCode: 4000,
  cityName: 'חיפה',
  area: 'haifa',
  isActive: true,
};

const account: PlaceAccountResponse = { id: 'account-1', email: 'shalom.hakiryot@example.co.il', username: 'shalomhakiryot', placeId: place.id, isActive: true };

installMockFetch((url) => {
  if (url.pathname === `/v1/admin/places/${place.id}`) return jsonResponse(200, place);
  if (url.pathname === `/v1/admin/places/${place.id}/account`) return jsonResponse(200, account);
  if (url.pathname === '/v1/admin/places/story-noaccount') return jsonResponse(200, { ...place, id: 'story-noaccount' });
  if (url.pathname === '/v1/admin/places/story-noaccount/account') return jsonResponse(404, { error: 'account_not_found', message: 'אין חשבון' });
  if (url.pathname === '/v1/admin/places/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/places/story-loading') return NEVER_RESOLVES;
  return null;
});

const withRoute = (pathname: string, routePath: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname, search: '', hash: '', state: null, key: 'story' }}>
    <Route path={routePath} element={<Story />} />
  </Routes>
);

const meta: Meta<typeof PlaceFormPage> = {
  title: 'AdminPanel/PlaceFormPage',
  component: PlaceFormPage,
};

export default meta;
type Story = StoryObj<typeof PlaceFormPage>;

// A new place: no id, an already-active status control, and no account
// section yet (before the first save).
export const NewPlace: Story = { decorators: [withRoute('/admin/places/new', '/admin/places/new')] };

export const EditModeWithAccount: Story = { decorators: [withRoute(`/admin/places/${place.id}/edit`, '/admin/places/:id/edit')] };

export const EditModeNoAccountYet: Story = { decorators: [withRoute('/admin/places/story-noaccount/edit', '/admin/places/:id/edit')] };

export const EditModeLoading: Story = { decorators: [withRoute('/admin/places/story-loading/edit', '/admin/places/:id/edit')] };

export const EditModeLoadError: Story = { decorators: [withRoute('/admin/places/story-error/edit', '/admin/places/:id/edit')] };
