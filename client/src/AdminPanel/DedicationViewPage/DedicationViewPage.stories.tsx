import type { AdminDedication } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { userEvent, within } from 'storybook/test';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { DedicationViewPage } from './DedicationViewPage';

const NBSP = ' ';

const adminDedication = (overrides: Partial<AdminDedication>): AdminDedication => ({
  id: 'story-live',
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
    nameLine: `חנה${NBSP}דבורה${NBSP}ע״ה`,
    parentLine: `בת${NBSP}אברהם`,
    closingLine: 'תנצב״ה',
    donorCreditLine: `תרומת${NBSP}משפחת${NBSP}לוי`,
  },
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  ...overrides,
});

const takenDownDedication = adminDedication({
  id: 'story-takendown',
  state: 'takenDown',
  takenDownReason: 'בקשת המשפחה',
});

// A dedication for a family rather than a person: no honorific (only ever
// meaningful for a memorial), no parent name and therefore no gender to
// give it. The parent-name row and the Gender row both have to render
// correctly with nothing behind them.
const familyDedication = adminDedication({
  id: 'story-family',
  type: 'success',
  honoredName: 'משפחת לביא',
  honorific: undefined,
  honoredGender: undefined,
  parentName: undefined,
  donorFamilyName: undefined,
  closingLineEnabled: false,
  display: { formulaLine: 'להצלחת', nameLine: 'משפחת לביא' },
});

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/dedications/story-live') return jsonResponse(200, adminDedication({}));
  if (url.pathname === '/v1/admin/dedications/story-takendown') return jsonResponse(200, takenDownDedication);
  if (url.pathname === '/v1/admin/dedications/story-family') return jsonResponse(200, familyDedication);
  if (url.pathname === '/v1/admin/dedications/story-notfound') return jsonResponse(404, { error: 'not_found', message: 'לא נמצא' });
  if (url.pathname === '/v1/admin/dedications/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (url.pathname === '/v1/admin/dedications/story-loading') return NEVER_RESOLVES;
  if (url.pathname === '/v1/admin/dedications/story-takedown-flow') return jsonResponse(200, adminDedication({ id: 'story-takedown-flow' }));
  if (url.pathname === '/v1/admin/dedications/story-takedown-flow/takedown') {
    return jsonResponse(200, adminDedication({ id: 'story-takedown-flow', state: 'takenDown', takenDownReason: 'בקשת המשפחה' }));
  }
  return null;
});

const withRoute = (id: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/admin/dedications/${id}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/dedications/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof DedicationViewPage> = {
  title: 'AdminPanel/DedicationViewPage',
  component: DedicationViewPage,
};

export default meta;
type Story = StoryObj<typeof DedicationViewPage>;

export const Live: Story = { decorators: [withRoute('story-live')] };
export const TakenDown: Story = { decorators: [withRoute('story-takendown')] };
export const SuccessForFamily: Story = { decorators: [withRoute('story-family')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
export const Loading: Story = { decorators: [withRoute('story-loading')] };

// The takedown confirmation: irreversible from a reader's point of view, so
// it opens a dialog and requires a typed reason before the confirm button
// does anything (the reason field beside it is what to look at here).
export const TakedownConfirmation: Story = {
  decorators: [withRoute('story-takedown-flow')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'הסרת ההקדשה מהאתר' }));
    await within(document.body).findByText('להסיר את ההקדשה מהאתר?');
  },
};
