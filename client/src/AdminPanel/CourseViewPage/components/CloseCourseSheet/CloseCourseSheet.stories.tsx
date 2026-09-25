import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../../../.storybook/apiMocks';
import * as consts from './consts';
import { CloseCourseSheet } from './CloseCourseSheet';

const course = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה' });

const meta: Meta<typeof CloseCourseSheet> = {
  title: 'AdminPanel/CourseViewPage/CloseCourseSheet',
  component: CloseCourseSheet,
  args: { courseId: course.id, courseName: course.name, onDismiss: fn(), onClosed: fn() },
};

export default meta;
type Story = StoryObj<typeof CloseCourseSheet>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    await expect(canvas.findByRole('heading', { name: consts.CLOSE_COURSE_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.findByText('יסודות האמונה')).resolves.toBeInTheDocument();
  },
};

export const Confirming: Story = {
  parameters: { apiMocks: { handlers: { close: http.post(`/v1/admin/courses/${course.id}/close`, jsonResolver(course)) } } },
  play: async ({ args }) => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.CLOSE_COURSE_CONFIRM_LABEL }));
    await waitFor(() => expect(args.onClosed).toHaveBeenCalled());
  },
};

export const Pending: Story = {
  parameters: { apiMocks: { handlers: { close: http.post(`/v1/admin/courses/${course.id}/close`, loadingResolver) } } },
  play: async () => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.CLOSE_COURSE_CONFIRM_LABEL }));
    await waitFor(() => expect(canvas.getByRole('button', { name: consts.CLOSE_COURSE_CONFIRM_LABEL })).toBeDisabled());
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { close: http.post(`/v1/admin/courses/${course.id}/close`, errorResolver()) } } },
  play: async () => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.CLOSE_COURSE_CONFIRM_LABEL }));
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
  },
};
