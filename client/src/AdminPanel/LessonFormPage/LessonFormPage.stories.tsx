import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';

import { http, jsonResolver } from '../../../.storybook/apiMocks';
import { LessonFormPage } from './LessonFormPage';

const rabbi: RabbiResponse = { ...rabbiFixture({ id: 'story-edit-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה' }), prominence: 'known' };

const lesson: LessonResponse = {
  id: 'story-edit-lesson',
  title: 'עיונים בפרשת השבוע',
  rabbiId: rabbi.id,
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
};

// The picker's eager, query-less rabbi search fires on mount regardless of
// whether its popover is open.
const rabbisForPicker: RabbiResponse[] = [
  rabbi,
  { ...rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' }), prominence: 'known' },
  { ...rabbiFixture({ id: 'rabbi-2', name: 'משה לוי' }), prominence: 'local' },
  { ...rabbiFixture({ id: 'rabbi-3', name: 'נתן צבי אשכנזי הכהן' }), prominence: 'sought' },
];

// Only the requests the edit-mode form actually fires on mount are
// answered: the existing lesson, the rabbi it unlocks, the rabbi search
// above, its lesson-count summary for the already-picked rabbi, and
// `PlacePicker`'s own two calls (the whole place list, fired unconditionally
// on mount, and the duplicate hint, fired once this lesson's already-loaded
// address name and street settle).
const editModeHandlers = {
  lesson: http.get('/v1/admin/lessons/:id', jsonResolver(lesson)),
  rabbi: http.get('/v1/admin/rabbis/:id', jsonResolver(rabbi)),
  rabbis: http.get('/v1/admin/rabbis', jsonResolver({ items: rabbisForPicker, page: 1, pageSize: 50, total: rabbisForPicker.length })),
  rabbiLessonCount: http.get('/v1/admin/lessons', jsonResolver({ items: [lesson], page: 1, pageSize: 1, total: 4 })),
  places: http.get('/v1/places', jsonResolver({ items: [] })),
  similarPlaces: http.get('/v1/places/similar', jsonResolver({ items: [] })),
};

const withEditRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: `/admin/lessons/${lesson.id}/edit`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/lessons/:id/edit" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof LessonFormPage> = {
  title: 'AdminPanel/LessonFormPage',
  component: LessonFormPage,
  decorators: [withEditRoute],
  parameters: { apiMocks: { handlers: editModeHandlers } },
};

export default meta;
type Story = StoryObj<typeof LessonFormPage>;

// The edit-mode footer: save leads in DOM order, cancel follows, and both
// run full width in a stacked column below `md`.
export const EditMode: Story = {};

// The cancel-confirm sheet, reached the way it actually opens: edit a field
// so the form is dirty, then press cancel. The button hierarchy was just
// inverted (the safe "keep editing" is now the filled primary, the
// destructive "discard" a bordered danger ghost), which is the thing to
// look at here.
export const EditModeDiscardChangesSheet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Not `getByLabelText`: the title field's `<label>` also wraps its own
    // helper text after the input, so the label's full accessible name is
    // the field label plus that helper sentence, not the field label alone.
    const titleInput = await canvas.findByDisplayValue(lesson.title as string);
    await userEvent.type(titleInput, ' - גרסה מעודכנת');
    await userEvent.click(canvas.getByRole('button', { name: 'ביטול' }));
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
    await expect(canvas.findByDisplayValue(`${lesson.title} - גרסה מעודכנת`)).resolves.toBeInTheDocument();
  },
};
