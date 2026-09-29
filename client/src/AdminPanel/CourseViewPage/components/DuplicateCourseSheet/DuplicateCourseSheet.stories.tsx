import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';

import * as consts from '~/components/DuplicateCourseSheet/consts';
import { courseResponseFixture } from '~/courseFixture';

import { errorResolver, http, jsonResolver } from '../../../../../.storybook/apiMocks';
import { DuplicateCourseSheet } from './DuplicateCourseSheet';

const course = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה', cycle: 2 });
const duplicate = courseResponseFixture({ id: 'course-2', name: 'יסודות האמונה' });

const meta: Meta<typeof DuplicateCourseSheet> = {
  title: 'AdminPanel/CourseViewPage/DuplicateCourseSheet',
  component: DuplicateCourseSheet,
  args: { courseId: course.id, courseName: course.name, sourceCycle: course.cycle, onDismiss: fn(), onDuplicated: fn() },
};

export default meta;
type Story = StoryObj<typeof DuplicateCourseSheet>;

export const Default: Story = {
  play: async () => {
    // The sheet portals into document.body (ResponsiveSheet), never the
    // canvas root: every query here reads from there.
    const canvas = within(document.body);
    await expect(canvas.findByRole('heading', { name: consts.DUPLICATE_COURSE_HEADING })).resolves.toBeInTheDocument();
    const cycleInput = (await canvas.findByLabelText(consts.CYCLE_LABEL)) as HTMLInputElement;
    await expect(cycleInput.value).toEqual('3');
  },
};

export const Confirming: Story = {
  parameters: { apiMocks: { handlers: { duplicate: http.post(`/v1/admin/courses/${course.id}/duplicate`, jsonResolver(duplicate)) } } },
  play: async ({ args }) => {
    const canvas = within(document.body);
    const dateInput = await canvas.findByLabelText(consts.OPENING_DATE_LABEL);
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    await userEvent.click(canvas.getByRole('button', { name: consts.DUPLICATE_COURSE_CONFIRM_LABEL }));
    await waitFor(() => expect(args.onDuplicated).toHaveBeenCalledWith(duplicate));
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { duplicate: http.post(`/v1/admin/courses/${course.id}/duplicate`, errorResolver()) } } },
  play: async () => {
    const canvas = within(document.body);
    const dateInput = await canvas.findByLabelText(consts.OPENING_DATE_LABEL);
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    await userEvent.click(canvas.getByRole('button', { name: consts.DUPLICATE_COURSE_CONFIRM_LABEL }));
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
  },
};
