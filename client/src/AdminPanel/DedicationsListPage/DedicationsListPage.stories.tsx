import type { AdminDedication } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

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

installMockFetch((url) => {
  if (url.pathname !== '/v1/admin/dedications') return null;
  if (scenario === 'loading') return NEVER_RESOLVES;
  if (scenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (scenario === 'empty') return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
  return jsonResponse(200, { items: populatedItems, page: 1, pageSize: 50, total: populatedItems.length });
});

const withScenario = (next: Scenario) => (Story: React.ComponentType) => {
  scenario = next;
  return <Story />;
};

const meta: Meta<typeof DedicationsListPage> = {
  title: 'AdminPanel/DedicationsListPage',
  component: DedicationsListPage,
};

export default meta;
type Story = StoryObj<typeof DedicationsListPage>;

export const Populated: Story = { decorators: [withScenario('populated')] };
export const Empty: Story = { decorators: [withScenario('empty')] };
export const Loading: Story = { decorators: [withScenario('loading')] };
export const ServerError: Story = { decorators: [withScenario('error')] };
