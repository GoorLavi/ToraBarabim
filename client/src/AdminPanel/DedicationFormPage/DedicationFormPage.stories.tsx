import type { AdminDedication } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { userEvent, within } from 'storybook/test';

import { installMockFetch, jsonResponse } from '~/storyMocks';

import { DedicationFormPage } from './DedicationFormPage';

const NBSP = ' ';

// `installMockFetch` answers by URL only (storyMocks.ts), so this fixed
// response stands in for whatever the draft actually says: good enough to
// prove the preview slot renders through `DedicationUnit` once a request
// lands, which is what `PreviewPopulated` below checks.
const PREVIEW_RESPONSE = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `אברהם כהן`,
  parentLine: undefined,
  closingLine: undefined,
  donorCreditLine: undefined,
};

const existingDedication: AdminDedication = {
  id: 'story-edit-dedication',
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
};

// Set by whichever story's `play` submits a create, so the one mocked
// `POST /v1/admin/dedications` can answer either with success or with the
// server's flattened validation issues, without a second endpoint.
// `installMockFetch` answers by URL alone (storyMocks.ts), so the create and
// the update routes never collide: only a create hits the bare collection
// path, and `existingDedication.id` never fetches or saves anything else in
// this file.
type CreateScenario = 'success' | 'invalidName';
let createScenario: CreateScenario = 'success';

installMockFetch((url) => {
  if (url.pathname === '/v1/admin/dedications/preview') return jsonResponse(200, PREVIEW_RESPONSE);

  if (url.pathname === `/v1/admin/dedications/${existingDedication.id}`) return jsonResponse(200, existingDedication);

  if (url.pathname === '/v1/admin/dedications') {
    if (createScenario === 'invalidName') {
      return jsonResponse(400, {
        error: 'invalid_request',
        message: 'הבקשה אינה תקינה',
        details: {
          formErrors: [],
          fieldErrors: { honoredName: ['שם עברי אינו יכול להכיל גרש או גרשיים באנגלית (" או \'), יש להשתמש בסימני הפיסוק העבריים ״ ו-׳ בלבד'] },
        },
      });
    }
    return jsonResponse(201, { ...existingDedication, id: 'story-new-dedication' });
  }

  return null;
});

const withCreateRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: '/admin/dedications/new', search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/dedications/new" element={<Story />} />
  </Routes>
);

const withEditRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: `/admin/dedications/${existingDedication.id}/edit`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/dedications/:id/edit" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof DedicationFormPage> = {
  title: 'AdminPanel/DedicationFormPage',
  component: DedicationFormPage,
};

export default meta;
type Story = StoryObj<typeof DedicationFormPage>;

// A fresh create form: `type` already defaults to a selection, but with no
// name yet the preview slot shows its own quiet line rather than a spinner
// or an empty box.
export const New: Story = {
  decorators: [withCreateRoute],
  play: () => {
    createScenario = 'success';
  },
};

export const EditMode: Story = { decorators: [withEditRoute] };

// The preview once a type and a name both exist: typing settles the 300ms
// debounce and the mocked `preview` endpoint answers, rendering through the
// real `DedicationUnit`.
export const PreviewPopulated: Story = {
  decorators: [withCreateRoute],
  play: async ({ canvasElement }) => {
    createScenario = 'success';
    const canvas = within(canvasElement);
    // Not exact `findByLabelText`: the field's `<label>` also wraps its own
    // helper sentence after the input (mirrors `RabbiFormPage.stories.tsx`'s
    // own note on this same trap), so the label's full accessible name is
    // the field label plus that helper text, not the field label alone.
    const nameInput = await canvas.findByLabelText('השם שיופיע בהקדשה', { exact: false });
    await userEvent.type(nameInput, 'אברהם כהן');
    await canvas.findByText('אברהם כהן', {}, { timeout: 2000 });
  },
};

// The server's flattened `details.fieldErrors`, not a client-side "required"
// check: an ASCII quote in the name passes this form's own required-field
// validation but is rejected by the server, and the message lands beside
// the name field, not as one banner.
export const ValidationError: Story = {
  decorators: [withCreateRoute],
  play: async ({ canvasElement }) => {
    createScenario = 'invalidName';
    const canvas = within(canvasElement);
    const nameInput = await canvas.findByLabelText('השם שיופיע בהקדשה', { exact: false });
    await userEvent.type(nameInput, 'דוד"');
    const startsOnInput = canvas.getByLabelText('תאריך התחלה');
    await userEvent.type(startsOnInput, '2026-10-01');
    const endsOnInput = canvas.getByLabelText('תאריך סיום');
    await userEvent.type(endsOnInput, '2026-12-01');
    await userEvent.click(canvas.getByRole('button', { name: 'שמירת ההקדשה' }));
    await canvas.findByText('שם עברי אינו יכול להכיל גרש או גרשיים באנגלית (" או \'), יש להשתמש בסימני הפיסוק העבריים ״ ו-׳ בלבד');
  },
};

// A parent name with no gender chosen: the picker only appears once the
// parent name has content, and starts with neither pill selected (no
// default, per the story above and DedicationFormPage/models.ts), so this
// is a real state the client-side check has to catch before the request
// ever reaches the server.
export const MissingGenderError: Story = {
  decorators: [withCreateRoute],
  play: async ({ canvasElement }) => {
    createScenario = 'success';
    const canvas = within(canvasElement);
    const nameInput = await canvas.findByLabelText('השם שיופיע בהקדשה', { exact: false });
    await userEvent.type(nameInput, 'משה כהן');
    const parentNameInput = await canvas.findByLabelText('שם האב', { exact: false });
    await userEvent.type(parentNameInput, 'אברהם');
    const startsOnInput = canvas.getByLabelText('תאריך התחלה');
    await userEvent.type(startsOnInput, '2026-10-01');
    const endsOnInput = canvas.getByLabelText('תאריך סיום');
    await userEvent.type(endsOnInput, '2026-12-01');
    await userEvent.click(canvas.getByRole('button', { name: 'שמירת ההקדשה' }));
    await canvas.findByText('יש לבחור בן או בת');
  },
};
