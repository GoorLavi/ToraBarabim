import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';

import { errorResolver, http, jsonResolver } from '../../../../../.storybook/apiMocks';
import * as consts from '~/components/MarkCourseFullSheet/consts';
import { MarkCourseFullSheet } from './MarkCourseFullSheet';

const course = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה' });

const meta: Meta<typeof MarkCourseFullSheet> = {
  title: 'RabbiPanel/CourseFormPage/MarkCourseFullSheet',
  component: MarkCourseFullSheet,
  args: { courseId: course.id, courseName: course.name, onDismiss: fn(), onMarkedFull: fn() },
};

export default meta;
type Story = StoryObj<typeof MarkCourseFullSheet>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    await expect(canvas.findByRole('heading', { name: consts.MARK_FULL_HEADING })).resolves.toBeInTheDocument();
  },
};

export const Confirming: Story = {
  parameters: { apiMocks: { handlers: { full: http.post(`/v1/rabbi/courses/${course.id}/full`, jsonResolver(course)) } } },
  play: async ({ args }) => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.MARK_FULL_CONFIRM_LABEL }));
    await waitFor(() => expect(args.onMarkedFull).toHaveBeenCalled());
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { full: http.post(`/v1/rabbi/courses/${course.id}/full`, errorResolver()) } } },
  play: async () => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.MARK_FULL_CONFIRM_LABEL }));
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
  },
};
