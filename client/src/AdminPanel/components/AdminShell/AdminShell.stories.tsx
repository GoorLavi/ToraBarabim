import type { AdminUser } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { atFrameSize } from '~/storyMocks';

import { http, jsonResolver } from '../../../../.storybook/apiMocks';
import * as consts from './consts';
import { AdminShell } from './AdminShell';

const nonSuperAdmin: AdminUser = { id: 'story-admin', email: 'admin@torabarabim.org.il', name: 'רותם לוי', isSuper: false };
const superAdmin: AdminUser = { ...nonSuperAdmin, id: 'story-super-admin', isSuper: true };

const withAdminRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: ADMIN_ROUTES.lessons, search: '', hash: '', state: null, key: 'story' }}>
    <Route path={ADMIN_ROUTES.lessons} element={<Story />} />
  </Routes>
);

const meta: Meta<typeof AdminShell> = {
  title: 'AdminPanel/AdminShell',
  component: AdminShell,
  decorators: [withAdminRoute],
};

export default meta;
type Story = StoryObj<typeof AdminShell>;

// A non-super admin's five tabs (courses added a tab), below `md`: a 3
// column grid (`gridColumns`, `ceil(5 / 2)` is 3), one cell short of full.
export const TabGridPhoneNonSuper: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(nonSuperAdmin)) } } },
  play: async ({ canvasElement }) =>
    atFrameSize(375, 700, async () => {
      const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
      await expect(within(nav).findAllByRole('link')).resolves.toHaveLength(5);
      expect(getComputedStyle(nav).display).toEqual('grid');
      expect(getComputedStyle(nav).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(3);
    }),
};

// A super admin's sixth tab fills the same 3 column grid exactly (`ceil(6 /
// 2)` is also 3): the scenario the admin panel's tab overflow was first
// found in (plan section 3.4).
export const TabGridPhoneSuper: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(superAdmin)) } } },
  play: async ({ canvasElement }) =>
    atFrameSize(375, 700, async () => {
      const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
      await expect(within(nav).findAllByRole('link')).resolves.toHaveLength(6);
      expect(getComputedStyle(nav).display).toEqual('grid');
      expect(getComputedStyle(nav).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(3);
    }),
};

// From `md` up, unchanged from before the extraction: a single flex row,
// whatever the tab count.
export const TabRowDesktop: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(superAdmin)) } } },
  play: async ({ canvasElement }) =>
    atFrameSize(1280, 800, async () => {
      const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
      expect(getComputedStyle(nav).display).toEqual('flex');
    }),
};
