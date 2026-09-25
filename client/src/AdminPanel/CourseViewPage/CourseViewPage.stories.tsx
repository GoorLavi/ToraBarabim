import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { placeholderPhoto } from '~/storyMocks';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { CourseViewPage } from './CourseViewPage';

const openCourse = courseResponseFixture({
  id: 'course-1',
  name: 'יסודות האמונה',
  cycle: 3,
  photos: [
    { id: 'p1', url: placeholderPhoto(600, 450) },
    { id: 'p2', url: placeholderPhoto(600, 450) },
  ],
});
const unlinkedCourse = courseResponseFixture({ id: 'course-2', name: 'מבוא לתפילה', teacher: { kind: 'named', name: 'הרב פלוני אלמוני' } });
const closedCourse = courseResponseFixture({
  id: 'course-3',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: '2026-10-01', leavesListsOn: '2026-10-08' },
});
const fullCourse = courseResponseFixture({
  id: 'course-4',
  name: 'עיון בפרשת השבוע',
  lifecycle: { status: 'closed', reason: 'full', closedOn: '2026-09-20', leavesListsOn: '2026-09-27' },
});

const withRoute = (id: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/courses/${id}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/courses/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof CourseViewPage> = {
  title: 'AdminPanel/CourseViewPage',
  component: CourseViewPage,
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof CourseViewPage>;

export const Open: Story = {
  decorators: [withRoute(openCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(openCourse)) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: /יסודות האמונה/ })).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: consts.EDIT_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.MARK_FULL_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.CLOSE_REGISTRATION_LABEL })).toBeInTheDocument();
  },
};

export const UnlinkedTeacher: Story = {
  decorators: [withRoute(unlinkedCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(unlinkedCourse)) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(new RegExp(consts.UNLINKED_TEACHER_SUFFIX))).resolves.toBeInTheDocument();
  },
};

export const Closed: Story = {
  decorators: [withRoute(closedCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(closedCourse)) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.CLOSED_EXPLANATION)).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.DUPLICATE_LABEL })).toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: consts.EDIT_LABEL })).not.toBeInTheDocument();
  },
};

export const MarkedFull: Story = {
  decorators: [withRoute(fullCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(fullCourse)) } } },
};

export const Loading: Story = {
  decorators: [withRoute(openCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByLabelText(consts.LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const Failed: Story = {
  decorators: [withRoute(openCourse.id)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.RETRY_LABEL })).toBeInTheDocument();
  },
};
