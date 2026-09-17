import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { CancelExceptionSheet } from './CancelExceptionSheet';

const row = (overrides: Partial<OccurrenceRowData> = {}): OccurrenceRowData => ({
  date: '2026-09-22',
  dateLabel: 'יום שלישי, 22.09.2026',
  startTime: '20:30',
  status: 'scheduled',
  placeName: 'בית הכנסת המרכזי',
  cityName: 'חיפה',
  cancellationReason: undefined,
  movedFromTime: undefined,
  placeChanged: false,
  hasExistingException: false,
  existingException: undefined,
  ...overrides,
});

// Story-specific lesson ids route the POST this sheet sends to a different
// outcome per story, the only signal available since the sheet itself
// fetches nothing (`RabbiLessonsSection.stories.tsx`'s own pattern for a
// component with no query of its own).
installMockFetch((url, method) => {
  if (method !== 'POST' || !url.pathname.endsWith('/exceptions')) return null;
  if (url.pathname === '/v1/admin/lessons/cancel-story-error/exceptions') {
    return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  }
  if (url.pathname === '/v1/admin/lessons/cancel-story-saving/exceptions') return NEVER_RESOLVES;
  return jsonResponse(201, { id: 99, lessonId: 'cancel-story-default', kind: 'cancelled', date: '2026-09-22' });
});

const meta: Meta<typeof CancelExceptionSheet> = {
  title: 'AdminPanel/OccurrencesSection/CancelExceptionSheet',
  component: CancelExceptionSheet,
  args: { onDismiss: () => {} },
};

export default meta;
type Story = StoryObj<typeof CancelExceptionSheet>;

export const RecurringLesson: Story = {
  args: { lessonId: 'cancel-story-default', row: row({}), isWeeklyRecurrence: true },
};

// The "other dates stay as usual" clause does not apply to a one-time
// lesson's only date, so it is not rendered (consts.ts's `cancelSheetBody`).
export const OneTimeLesson: Story = {
  args: { lessonId: 'cancel-story-default', row: row({}), isWeeklyRecurrence: false },
};

export const Saving: Story = {
  args: { lessonId: 'cancel-story-saving', row: row({}), isWeeklyRecurrence: true },
  play: async () => {
    const body = within(document.body);
    const confirmButton = body.getByRole('button', { name: 'כן, לבטל את המועד' });
    await userEvent.click(confirmButton);
    await expect(confirmButton).toBeDisabled();
  },
};

export const MutationError: Story = {
  args: { lessonId: 'cancel-story-error', row: row({}), isWeeklyRecurrence: true },
  play: async () => {
    const body = within(document.body);
    // Not `getByLabelText`: the field's `<label>` also wraps the helper
    // lines after the textarea (`CancelExceptionSheet.tsx`), so the
    // implicit label's full accessible name is the field label plus both
    // helper sentences, not the field label alone (`LessonFormPage.
    // stories.tsx` has the same trap with its own title field).
    await userEvent.type(body.getByRole('textbox'), 'הרב חולה');
    await userEvent.click(body.getByRole('button', { name: 'כן, לבטל את המועד' }));
    await body.findByRole('alert');
  },
};
