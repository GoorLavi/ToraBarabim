import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import * as galleryFieldConsts from '~/components/GalleryField/consts';
import { courseResponseFixture } from '~/courseFixture';
import { panelShellDecorator } from '~/storyDecorators';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import * as teacherPickerConsts from './components/TeacherPicker/consts';
import * as consts from './consts';
import { CourseFormPage } from './CourseFormPage';

const openCourse = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה', cycle: 3 });
const unlinkedCourse = courseResponseFixture({ id: 'course-2', name: 'מבוא לתפילה', teacher: { kind: 'named', name: 'הרב פלוני אלמוני' } });

// TeacherPicker's own useRabbiSearch fetches immediately on mount, before
// anyone opens the search popover, so every story that renders the form
// itself (not just its loading or error state) needs this mocked.
const rabbisHandler = http.get('/v1/admin/rabbis', jsonResolver({ items: [], page: 1, pageSize: 50, total: 0 }));

// The where-section's own `PlacePicker` mounts unconditionally (CourseFormFields.tsx),
// so every story that renders the form itself needs this too.
const placesHandler = http.get('/v1/places', jsonResolver({ items: [] }));

const withRoute = (pathname: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/courses/new" element={<Story />} />
    <Route path="/courses/:id/edit" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof CourseFormPage> = {
  title: 'AdminPanel/CourseFormPage',
  component: CourseFormPage,
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof CourseFormPage>;

export const CreateMode: Story = {
  decorators: [withRoute('/courses/new')],
  parameters: { apiMocks: { handlers: { rabbis: rabbisHandler, places: placesHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.NEW_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByText(consts.TEACHER_SECTION_HEADING)).toBeInTheDocument();
    await expect(canvas.getByText(galleryFieldConsts.galleryCountLabel(0))).toBeInTheDocument();
  },
};

export const EditModeLinkedTeacher: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}/edit`)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(openCourse)), rabbis: rabbisHandler, places: placesHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.EDIT_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByDisplayValue('יסודות האמונה')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: teacherPickerConsts.CLEAR_SELECTION_LABEL })).toBeInTheDocument();
  },
};

export const EditModeUnlinkedTeacher: Story = {
  decorators: [withRoute(`/courses/${unlinkedCourse.id}/edit`)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', jsonResolver(unlinkedCourse)), rabbis: rabbisHandler, places: placesHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = (await canvas.findByLabelText(teacherPickerConsts.NAMED_LABEL)) as HTMLInputElement;
    await expect(input.value).toEqual('הרב פלוני אלמוני');
  },
};

export const EditModeLoading: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}/edit`)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const EditModeError: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}/edit`)],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/admin/courses/:id', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.RETRY_LABEL })).toBeInTheDocument();
  },
};
