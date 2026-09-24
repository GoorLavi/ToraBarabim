import type { RabbiAccountResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';

import { http, jsonResolver } from '../../../.storybook/apiMocks';
import { RabbiFormPage } from './RabbiFormPage';

const rabbi: RabbiResponse = {
  ...rabbiFixture({ id: 'story-editable-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה', bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר.' }),
  prominence: 'known',
};

const account: RabbiAccountResponse = { id: 'account-1', email: 'yaakov.mizrahi@example.co.il', username: 'yaakovm', rabbiId: rabbi.id, isActive: true };

// Only the requests the edit-mode form actually fires on mount are
// answered: the existing rabbi and its login account.
// `RabbiAccountSection`'s create-account path (a 404 'account_not_found')
// is not exercised here, since this rabbi already has an active account.
const editModeHandlers = {
  rabbi: http.get('/v1/admin/rabbis/:id', jsonResolver(rabbi)),
  account: http.get('/v1/admin/rabbis/:id/account', jsonResolver(account)),
};

const withEditRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: `/admin/rabbis/${rabbi.id}/edit`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/rabbis/:id/edit" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof RabbiFormPage> = {
  title: 'AdminPanel/RabbiFormPage',
  component: RabbiFormPage,
  decorators: [withEditRoute],
  parameters: { apiMocks: { handlers: editModeHandlers } },
};

export default meta;
type Story = StoryObj<typeof RabbiFormPage>;

// The edit-mode footer: save leads, cancel follows.
export const EditMode: Story = {};

// The cancel-confirm sheet, reached the way it actually opens: edit a
// field so the form is dirty, then press cancel. Same inverted button
// hierarchy as `LessonFormPage`'s sheet (see that story for why it matters).
export const EditModeDiscardChangesSheet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Not `getByLabelText`: the name field's `<label>` also wraps its own
    // helper text after the input, so the label's full accessible name is
    // the field label plus that helper sentence, not the field label alone.
    const nameInput = await canvas.findByDisplayValue(rabbi.name);
    await userEvent.type(nameInput, ' הי');
    await userEvent.click(canvas.getByRole('link', { name: 'ביטול' }));
    await within(document.body).findByRole('dialog', { name: 'לצאת בלי לשמור?' });

    // Focus lands on the sheet itself, never on its destructive discard
    // button (ResponsiveSheet's own option A behaviour): a keyboard user
    // who opens this and presses Enter without reading must never throw
    // their edit away by doing nothing.
    const discardButton = within(document.body).getByRole('button', { name: 'כן, לצאת בלי לשמור' });
    expect(discardButton).not.toHaveFocus();

    // Escape closes the sheet too (ResponsiveSheet's own option A
    // behaviour), returning to editing with the form's own changes intact.
    await userEvent.keyboard('{Escape}');
    expect(within(document.body).queryByRole('dialog', { name: 'לצאת בלי לשמור?' })).not.toBeInTheDocument();
    await expect(canvas.findByDisplayValue(`${rabbi.name} הי`)).resolves.toBeInTheDocument();
  },
};
