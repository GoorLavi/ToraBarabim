import type { AdminUser } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, waitFor, within } from 'storybook/test';

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
      // Waited, not read once: `atFrameSize`'s own resize still has the grid
      // reflowing for a moment after the frame's width changes.
      await waitFor(() => expect(getComputedStyle(nav).display).toEqual('grid'));
      await waitFor(() => expect(getComputedStyle(nav).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(3));
    }),
};

// A super admin has seven tabs (messages joined the admins tab): `ceil(7 /
// 2)` is 4 columns, one cell short of full, the same two-row grid the
// admin panel's tab overflow was first fixed with (plan section 3.4).
export const TabGridPhoneSuper: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(superAdmin)) } } },
  play: async ({ canvasElement }) =>
    atFrameSize(375, 700, async () => {
      const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
      await expect(within(nav).findAllByRole('link')).resolves.toHaveLength(7);
      await waitFor(() => expect(getComputedStyle(nav).display).toEqual('grid'));
      await waitFor(() => expect(getComputedStyle(nav).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(4));
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

// The messages tab is for the super admin alone: the server refuses everyone
// else regardless (0020), and the tab is not shown to them.
export const MessagesTabShownToSuperAdmin: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(superAdmin)) } } },
  play: async ({ canvasElement }) => {
    const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
    await expect(within(nav).findByRole('link', { name: consts.MESSAGES_TAB_LABEL })).resolves.toHaveAttribute('href', ADMIN_ROUTES.messages);
  },
};

export const MessagesTabHiddenFromNonSuperAdmin: Story = {
  parameters: { apiMocks: { handlers: { session: http.get('/v1/admin/me', jsonResolver(nonSuperAdmin)) } } },
  play: async ({ canvasElement }) => {
    const nav = await within(canvasElement).findByRole('navigation', { name: consts.NAV_LABEL });
    await expect(within(nav).findAllByRole('link')).resolves.toHaveLength(5);
    await expect(within(nav).queryByRole('link', { name: consts.MESSAGES_TAB_LABEL })).toBeNull();
  },
};
