import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';

import { errorResolver, http, jsonResolver } from '../../../../../.storybook/apiMocks';
import * as consts from './consts';
import { DuplicateCourseSheet } from './DuplicateCourseSheet';

const course = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה' });
const duplicate = courseResponseFixture({ id: 'course-2', name: 'יסודות האמונה' });

const meta: Meta<typeof DuplicateCourseSheet> = {
  title: 'RabbiPanel/CourseFormPage/DuplicateCourseSheet',
  component: DuplicateCourseSheet,
  args: { courseId: course.id, courseName: course.name, onDismiss: fn(), onDuplicated: fn() },
};

export default meta;
type Story = StoryObj<typeof DuplicateCourseSheet>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    await expect(canvas.findByRole('heading', { name: consts.DUPLICATE_COURSE_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.findByText('יסודות האמונה')).resolves.toBeInTheDocument();
  },
};

// Confirming with no opening date chosen never fires the request at all.
export const MissingOpeningDate: Story = {
  play: async () => {
    const canvas = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: consts.DUPLICATE_COURSE_CONFIRM_LABEL }));
    await expect(canvas.findByText(consts.MISSING_OPENING_DATE_ERROR)).resolves.toBeInTheDocument();
  },
};

export const Confirming: Story = {
  parameters: { apiMocks: { handlers: { duplicate: http.post(`/v1/rabbi/courses/${course.id}/duplicate`, jsonResolver(duplicate)) } } },
  play: async ({ args }) => {
    const canvas = within(document.body);
    const dateInput = await canvas.findByLabelText(consts.OPENING_DATE_LABEL);
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    await userEvent.click(canvas.getByRole('button', { name: consts.DUPLICATE_COURSE_CONFIRM_LABEL }));
    await waitFor(() => expect(args.onDuplicated).toHaveBeenCalledWith(duplicate));
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { duplicate: http.post(`/v1/rabbi/courses/${course.id}/duplicate`, errorResolver()) } } },
  play: async () => {
    const canvas = within(document.body);
    const dateInput = await canvas.findByLabelText(consts.OPENING_DATE_LABEL);
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    await userEvent.click(canvas.getByRole('button', { name: consts.DUPLICATE_COURSE_CONFIRM_LABEL }));
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
  },
};
