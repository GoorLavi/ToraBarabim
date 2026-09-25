import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { COURSE_CLOSED_RECORD_EXPLANATION, COURSE_DELETE_ACTION_LABEL, COURSE_DUPLICATE_ACTION_LABEL } from '~/consts';
import { courseResponseFixture } from '~/courseFixture';
import { placeholderPhoto } from '~/storyMocks';

import * as consts from './consts';
import { ReadOnlyCourseRecord } from './ReadOnlyCourseRecord';

const closedCourse = courseResponseFixture({
  id: 'course-1',
  name: 'יסודות האמונה',
  cycle: 3,
  priceShekels: 350,
  photos: [{ id: 'p1', url: placeholderPhoto(600, 450) }],
  lifecycle: { status: 'closed', reason: 'closed', closedOn: '2026-10-01', leavesListsOn: '2026-10-08' },
});

const fullCourse = courseResponseFixture({
  id: 'course-2',
  name: 'עיון בפרשת השבוע',
  lifecycle: { status: 'closed', reason: 'full', closedOn: '2026-09-20', leavesListsOn: '2026-09-27' },
});

const meta: Meta<typeof ReadOnlyCourseRecord> = {
  title: 'RabbiPanel/CourseFormPage/ReadOnlyCourseRecord',
  component: ReadOnlyCourseRecord,
  args: { onOpenDuplicate: fn(), onOpenDelete: fn() },
};

export default meta;
type Story = StoryObj<typeof ReadOnlyCourseRecord>;

export const ClosedByCalendar: Story = {
  args: { course: closedCourse },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(COURSE_CLOSED_RECORD_EXPLANATION)).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: COURSE_DUPLICATE_ACTION_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: COURSE_DELETE_ACTION_LABEL })).toBeInTheDocument();
  },
};

export const MarkedFull: Story = {
  args: { course: fullCourse },
};
