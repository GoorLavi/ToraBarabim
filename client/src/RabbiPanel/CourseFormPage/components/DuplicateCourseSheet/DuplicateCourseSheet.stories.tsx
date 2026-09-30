import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';

import * as consts from '~/components/DuplicateCourseSheet/consts';
import { courseResponseFixture } from '~/courseFixture';

import { errorResolver, http, jsonResolver } from '../../../../../.storybook/apiMocks';
import { DuplicateCourseSheet } from './DuplicateCourseSheet';

const course = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה', cycle: 2 });
const duplicate = courseResponseFixture({ id: 'course-2', name: 'יסודות האמונה' });

const meta: Meta<typeof DuplicateCourseSheet> = {
  title: 'RabbiPanel/CourseFormPage/DuplicateCourseSheet',
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
    await expect(canvas.findByText('יסודות האמונה')).resolves.toBeInTheDocument();
    // The cycle field is prefilled one higher than the source's own.
    const cycleInput = (await canvas.findByLabelText(consts.CYCLE_LABEL)) as HTMLInputElement;
    await expect(cycleInput.value).toEqual('3');
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

// `onDuplicated` is asserted here with the new course the request answers
// with; `CourseFormPage.tsx` itself navigates to that course's own edit
// route from there (`navigate(RABBI_ROUTES.courseEdit(course.id))`). A
// story covering that landing (the edit form pre-filled with the new date
// and cycle) is not expressible in the story pattern this codebase uses:
// every story renders at a `<Routes location={fixedLocation}>` fixed to one
// route, which cannot observe a `useNavigate()` call actually changing the
// rendered route within a single story. Accepted gap, not missed coverage.
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
