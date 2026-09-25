import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { isoDateOffsetByDays } from '~/storyMocks';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { CoursesListPage } from './CoursesListPage';

const openCourse = courseResponseFixture({ id: 'course-open', name: 'יסודות האמונה', cycle: 3 });
const unlinkedCourse = courseResponseFixture({
  id: 'course-unlinked',
  name: 'מבוא לתפילה',
  teacher: { kind: 'named', name: 'הרב פלוני אלמוני' },
});
// `closedOn` a week ahead of `leavesListsOn`, the course's own real order,
// computed against today rather than a fixed date that will quietly move
// to the other side of it (design gate round 4 finding).
const fullCourse = courseResponseFixture({
  id: 'course-full',
  name: 'עיון בפרשת השבוע',
  lifecycle: { status: 'closed', reason: 'full', closedOn: isoDateOffsetByDays(-3), leavesListsOn: isoDateOffsetByDays(4) },
});
const closedCourse = courseResponseFixture({
  id: 'course-closed',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: isoDateOffsetByDays(0), leavesListsOn: isoDateOffsetByDays(7) },
});

const coursesHandler = (items: ReturnType<typeof courseResponseFixture>[]) =>
  http.get('/v1/admin/courses', jsonResolver({ items, page: 1, pageSize: 50, total: items.length }));

// The filter bar's own rabbi search fetches immediately on mount (mirrors
// CourseFormPage.stories.tsx's own TeacherPicker comment), so every story
// here needs this too.
const rabbisHandler = http.get('/v1/admin/rabbis', jsonResolver({ items: [], page: 1, pageSize: 50, total: 0 }));

const meta: Meta<typeof CoursesListPage> = {
  title: 'AdminPanel/CoursesListPage',
  component: CoursesListPage,
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof CoursesListPage>;

export const Populated: Story = {
  parameters: { apiMocks: { handlers: { courses: coursesHandler([openCourse, unlinkedCourse, fullCourse, closedCourse]), rabbis: rabbisHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The phone card list and the desktop table both render at once (CSS
    // picks which one shows), so every course name appears twice.
    await waitFor(() => expect(canvas.getAllByText('יסודות האמונה').length).toBeGreaterThan(0));
    await expect(canvas.getAllByText('מבוא לתפילה').length).toBeGreaterThan(0);
  },
};

export const Loading: Story = {
  parameters: { apiMocks: { handlers: { courses: http.get('/v1/admin/courses', loadingResolver), rabbis: rabbisHandler } } },
};

export const Empty: Story = {
  parameters: { apiMocks: { handlers: { courses: coursesHandler([]), rabbis: rabbisHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.EMPTY_HEADLINE)).resolves.toBeInTheDocument();
    await expect(canvas.getByText(consts.EMPTY_HINT)).toBeInTheDocument();
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { courses: http.get('/v1/admin/courses', errorResolver()), rabbis: rabbisHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.RETRY_LABEL })).toBeInTheDocument();
  },
};
