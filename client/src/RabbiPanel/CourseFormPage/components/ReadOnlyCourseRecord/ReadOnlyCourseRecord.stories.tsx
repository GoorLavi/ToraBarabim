import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { COURSE_CLOSED_RECORD_EXPLANATION, COURSE_DELETE_ACTION_LABEL, COURSE_DUPLICATE_ACTION_LABEL } from '~/consts';
import { courseResponseFixture } from '~/courseFixture';
import { isoDateOffsetByDays, placeholderPhoto } from '~/storyMocks';

import * as consts from './consts';
import { ReadOnlyCourseRecord } from './ReadOnlyCourseRecord';

// `closedOn` a week ahead of `leavesListsOn`, the course's own real order,
// computed against today rather than a fixed date that will quietly move
// to the other side of it (design gate round 4 finding).
const closedCourse = courseResponseFixture({
  id: 'course-1',
  name: 'יסודות האמונה',
  cycle: 3,
  priceShekels: 350,
  photos: [{ id: 'p1', url: placeholderPhoto(600, 450) }],
  lifecycle: { status: 'closed', reason: 'closed', closedOn: isoDateOffsetByDays(0), leavesListsOn: isoDateOffsetByDays(7) },
});

const fullCourse = courseResponseFixture({
  id: 'course-2',
  name: 'עיון בפרשת השבוע',
  lifecycle: { status: 'closed', reason: 'full', closedOn: isoDateOffsetByDays(-3), leavesListsOn: isoDateOffsetByDays(4) },
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
