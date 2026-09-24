import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { errorResolver, http, respondWithJson } from '../../../../../.storybook/apiMocks';
import * as consts from './consts';
import { DeleteCourseSheet } from './DeleteCourseSheet';

const meta: Meta<typeof DeleteCourseSheet> = {
  title: 'RabbiPanel/CourseFormPage/DeleteCourseSheet',
  component: DeleteCourseSheet,
  args: { courseId: 'course-1', courseName: 'יסודות האמונה', onDismiss: fn(), onDeleted: fn() },
};

export default meta;
type Story = StoryObj<typeof DeleteCourseSheet>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    await expect(canvas.findByRole('heading', { name: consts.DELETE_COURSE_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.findByText('יסודות האמונה')).resolves.toBeInTheDocument();
  },
};

export const Confirming: Story = {
  parameters: { apiMocks: { handlers: { delete: http.delete('/v1/rabbi/courses/course-1', () => respondWithJson(undefined, 204)) } } },
  play: async ({ args }) => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.DELETE_COURSE_CONFIRM_LABEL }));
    await waitFor(() => expect(args.onDeleted).toHaveBeenCalled());
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { delete: http.delete('/v1/rabbi/courses/course-1', errorResolver()) } } },
  play: async () => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.DELETE_COURSE_CONFIRM_LABEL }));
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
  },
};
