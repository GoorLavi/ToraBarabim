import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { MoveExceptionSheet } from './MoveExceptionSheet';

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

// A date already moved to a different venue, including a floor and a
// substitute rabbi the sheet has no control for: reopening it should show
// the override already filled in, not a blank toggle (the fix this file
// exists to prove; see the report for this round).
const alreadyMovedRow = row({
  startTime: '21:15',
  movedFromTime: '20:30',
  placeChanged: true,
  placeName: 'בית מדרש נוסף',
  cityName: 'חיפה',
  hasExistingException: true,
  existingException: {
    id: 77,
    lessonId: 'move-story-prefilled',
    kind: 'modified',
    date: '2026-09-22',
    startTime: '21:15',
    place: { name: 'בית מדרש נוסף', street: 'הרצל 12', floor: 'קומה 2', cityCode: 4000, cityName: 'חיפה' },
    substituteRabbiId: 'rabbi-substitute',
    note: 'הרב הקבוע בחופשה',
  },
});

installMockFetch((url, method) => {
  if (!url.pathname.endsWith('/exceptions')) return null;
  if (method === 'POST' && url.pathname === '/v1/admin/lessons/move-story-error/exceptions') {
    return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  }
  if (method === 'POST' && url.pathname === '/v1/admin/lessons/move-story-saving/exceptions') return NEVER_RESOLVES;
  // Prefilled row's save is a PATCH (it already has an exception id); this
  // mock exists so the "carries the existing note and substitute rabbi
  // through" mutation body itself can be inspected in the network tab
  // during manual review, even though no story asserts on the request body.
  if (method === 'PATCH' && url.pathname === '/v1/admin/lessons/move-story-prefilled/exceptions/77') {
    return jsonResponse(200, alreadyMovedRow.existingException);
  }
  if (method === 'POST') return jsonResponse(201, { id: 1, lessonId: 'move-story-default', kind: 'modified', date: '2026-09-22', startTime: '21:00' });
  return null;
});

const meta: Meta<typeof MoveExceptionSheet> = {
  title: 'AdminPanel/OccurrencesSection/MoveExceptionSheet',
  component: MoveExceptionSheet,
  args: { onDismiss: () => {} },
};

export default meta;
type Story = StoryObj<typeof MoveExceptionSheet>;

export const NewMove: Story = {
  args: { lessonId: 'move-story-default', row: row({}) },
};

export const PrefilledFromExistingOverride: Story = {
  args: { lessonId: 'move-story-prefilled', row: alreadyMovedRow },
};

export const ValidationError: Story = {
  args: { lessonId: 'move-story-default', row: row({}) },
  play: async () => {
    const body = within(document.body);
    await userEvent.click(body.getByRole('checkbox'));
    await userEvent.click(body.getByRole('button', { name: 'שמירת השינוי' }));
    await body.findByText('יש לבחור עיר');
    await body.findByText('יש למלא שם מקום');
    await body.findByText('יש למלא כתובת');
  },
};

export const Saving: Story = {
  args: { lessonId: 'move-story-saving', row: row({}) },
  play: async () => {
    const body = within(document.body);
    const saveButton = body.getByRole('button', { name: 'שמירת השינוי' });
    await userEvent.click(saveButton);
    await body.findByRole('button', { name: 'שומרים...' });
    await expect(saveButton).toBeDisabled();
  },
};

export const MutationError: Story = {
  args: { lessonId: 'move-story-error', row: row({}) },
  play: async () => {
    const body = within(document.body);
    await userEvent.click(body.getByRole('button', { name: 'שמירת השינוי' }));
    await body.findByRole('alert');
  },
};
