import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { atFrameSize } from '~/storyMocks';

import { http, jsonResolver } from '../../../../.storybook/apiMocks';
import * as consts from './consts';
import { RabbiShell } from './RabbiShell';

const rabbi = rabbiFixture({ id: 'story-rabbi', name: 'אייל עמרמי', title: 'ראש כולל' });

const withRabbiRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: RABBI_ROUTES.upcoming, search: '', hash: '', state: null, key: 'story' }}>
    <Route path={RABBI_ROUTES.upcoming} element={<Story />} />
  </Routes>
);

const meta: Meta<typeof RabbiShell> = {
  title: 'RabbiPanel/RabbiShell',
  component: RabbiShell,
  decorators: [withRabbiRoute],
  parameters: { apiMocks: { handlers: { profile: http.get('/v1/rabbi/profile', jsonResolver(rabbi)) } } },
};

export default meta;
type Story = StoryObj<typeof RabbiShell>;

// Three tabs, below `md`: the fixed two-row grid the tab strip now uses
// instead of the wrap it used to fall back to, one column short of full
// (`gridColumns`, `ceil(3 / 2)` is 2, so the third tab sits alone in the
// second row).
export const TabGridPhone: Story = {
  play: async ({ canvasElement }) =>
    atFrameSize(375, 700, async () => {
      const nav = within(canvasElement).getByRole('navigation', { name: consts.NAV_LABEL });
      expect(getComputedStyle(nav).display).toEqual('grid');
      expect(getComputedStyle(nav).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(2);
      expect(within(nav).getAllByRole('link')).toHaveLength(3);
    }),
};

// From `md` up, unchanged from before the extraction: a single flex row.
export const TabRowDesktop: Story = {
  play: async ({ canvasElement }) =>
    atFrameSize(1024, 700, async () => {
      const nav = within(canvasElement).getByRole('navigation', { name: consts.NAV_LABEL });
      expect(getComputedStyle(nav).display).toEqual('flex');
    }),
};
