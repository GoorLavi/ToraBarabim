import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';
import { rabbiFixture } from '~/rabbiFixture';
import { panelShellDecorator } from '~/storyDecorators';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { CourseFormPage } from './CourseFormPage';

const rabbiProfile = rabbiFixture({ id: 'story-rabbi', name: 'אייל עמרמי', title: 'ראש כולל' });
const rabbaniteProfile = rabbiFixture({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit', title: 'רבנית הקהילה' });

const openCourse = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה', cycle: 3 });
const closedCourse = courseResponseFixture({
  id: 'course-2',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: '2026-10-01', leavesListsOn: '2026-10-08' },
});

const profileHandler = (profile = rabbiProfile) => http.get('/v1/rabbi/profile', jsonResolver(profile));

const withRoute = (pathname: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/courses/new" element={<Story />} />
    <Route path="/courses/:id" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof CourseFormPage> = {
  title: 'RabbiPanel/CourseFormPage',
  component: CourseFormPage,
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof CourseFormPage>;

// A blank form: no cover picked yet, the gallery replaced by its own
// after-first-save note (a course with no id has no photos endpoint to
// upload to).
export const CreateMode: Story = {
  decorators: [withRoute('/courses/new')],
  parameters: { apiMocks: { handlers: { profile: profileHandler() } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.NEW_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByText(consts.GALLERY_AFTER_FIRST_SAVE_NOTE)).toBeInTheDocument();
  },
};

// A rabbanit's own create form: the audience section is a locked field, not
// a picker, the same as the lesson form's own treatment.
export const CreateModeRabbanit: Story = {
  decorators: [withRoute('/courses/new')],
  parameters: { apiMocks: { handlers: { profile: profileHandler(rabbaniteProfile) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('נשים')).resolves.toBeInTheDocument();
  },
};

// An open course, loaded for edit: every section pre-filled, the gallery
// live, and all three danger-zone actions available.
export const EditModeOpen: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}`)],
  parameters: {
    apiMocks: {
      handlers: { profile: profileHandler(), course: http.get('/v1/rabbi/courses/:id', jsonResolver(openCourse)) },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.EDIT_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByDisplayValue('יסודות האמונה')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.MARK_FULL_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.CLOSE_REGISTRATION_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.DELETE_LABEL })).toBeInTheDocument();
  },
};

export const EditModeLoading: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}`)],
  parameters: { apiMocks: { handlers: { profile: profileHandler(), course: http.get('/v1/rabbi/courses/:id', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const EditModeError: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}`)],
  parameters: { apiMocks: { handlers: { profile: profileHandler(), course: http.get('/v1/rabbi/courses/:id', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.RETRY_LABEL })).toBeInTheDocument();
  },
};

// The owner's decision (design brief B, item 7): a closed or full course
// renders the read-only record on this exact route, never the form.
export const EditModeClosedShowsReadOnlyRecord: Story = {
  decorators: [withRoute(`/courses/${closedCourse.id}`)],
  parameters: {
    apiMocks: {
      handlers: { profile: profileHandler(), course: http.get('/v1/rabbi/courses/:id', jsonResolver(closedCourse)) },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('הלכות שבת מעשיות')).resolves.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: consts.SAVE_LABEL })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'שכפול הקורס' })).toBeInTheDocument();
  },
};
