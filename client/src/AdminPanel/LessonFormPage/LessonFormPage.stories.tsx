import type { LessonResponse, RabbiResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse } from '~/storyMocks';

import { LessonFormPage } from './LessonFormPage';

const rabbi: RabbiResponse = { ...rabbiFixture({ id: 'story-edit-rabbi', name: 'יעקב מזרחי', title: 'ראש ישיבה' }), prominence: 'known' };

const lesson: LessonResponse = {
  id: 'story-edit-lesson',
  title: 'עיונים בפרשת השבוע',
  rabbiId: rabbi.id,
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', cityCode: 4000, cityName: 'חיפה' },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  provenance: 'manual',
};

// `RabbiPicker`'s eager, query-less rabbi search (fired on mount regardless
// of whether its popover is open) hits the exact same unfiltered
// `/v1/admin/rabbis?page=1&pageSize=50` request as `LessonsListPage`'s own
// rabbi-join fetch (`LessonsListPage.stories.tsx`), with nothing in the
// request to tell the two apart. `.storybook/preview.tsx` chains every
// story file's mock onto one `window.fetch`, and whichever file's mock last
// loaded answers both, so this list also carries `LessonsListPage.
// stories.tsx`'s three rabbis: if that file's join ever runs against this
// mock instead of its own, its lesson rows can still resolve a rabbi.
const rabbisListForSearchAndJoin: RabbiResponse[] = [
  rabbi,
  { ...rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' }), prominence: 'known' },
  { ...rabbiFixture({ id: 'rabbi-2', name: 'משה לוי' }), prominence: 'local' },
  { ...rabbiFixture({ id: 'rabbi-3', name: 'נתן צבי אשכנזי הכהן' }), prominence: 'sought' },
];

// Only the requests the edit-mode form actually fires on mount are
// answered: the existing lesson, the rabbi it unlocks, the rabbi search
// above, and its lesson-count summary for the already-picked rabbi.
installMockFetch((url) => {
  if (url.pathname === `/v1/admin/lessons/${lesson.id}`) return jsonResponse(200, lesson);
  if (url.pathname === `/v1/admin/rabbis/${rabbi.id}`) return jsonResponse(200, rabbi);
  if (url.pathname === '/v1/admin/rabbis') {
    return jsonResponse(200, { items: rabbisListForSearchAndJoin, page: 1, pageSize: 50, total: rabbisListForSearchAndJoin.length });
  }
  if (url.pathname === '/v1/admin/lessons' && url.searchParams.get('rabbiId') === rabbi.id) {
    return jsonResponse(200, { items: [lesson], page: 1, pageSize: 1, total: 4 });
  }
  return null;
});

const withEditRoute = (Story: React.ComponentType): React.ReactElement => (
  <Routes location={{ pathname: `/admin/lessons/${lesson.id}/edit`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/admin/lessons/:id/edit" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof LessonFormPage> = {
  title: 'AdminPanel/LessonFormPage',
  component: LessonFormPage,
  decorators: [withEditRoute],
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
  },
};
