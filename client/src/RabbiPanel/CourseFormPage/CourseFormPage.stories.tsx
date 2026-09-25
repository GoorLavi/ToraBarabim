import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import * as courseFormFieldsConsts from '~/components/CourseFormFields/consts';
import * as galleryFieldConsts from '~/components/GalleryField/consts';
import { courseResponseFixture } from '~/courseFixture';
import { rabbiFixture } from '~/rabbiFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { installMockFetch, jsonResponse, uploadGeneratedFileToInput } from '~/storyMocks';

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

// A blank form: no cover picked yet, and the gallery field already usable
// (design brief round 3, item 2: a create holds its own gallery locally and
// only uploads it once the course itself exists).
export const CreateMode: Story = {
  decorators: [withRoute('/courses/new')],
  parameters: { apiMocks: { handlers: { profile: profileHandler() } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.NEW_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByText(courseFormFieldsConsts.GALLERY_FIELD_LABEL)).toBeInTheDocument();
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
    await expect(canvas.getByRole('button', { name: 'שכפול לתאריך חדש' })).toBeInTheDocument();
  },
};

// design brief round 3, item 2: a picked gallery file, before the course
// itself exists, renders as a normal tile with no request to the photos
// endpoint, which does not exist yet for a course with no id.
export const CreateModeGalleryStaysLocalUntilSaved: Story = {
  decorators: [withRoute('/courses/new')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: consts.NEW_HEADING });

    let photoUploadRequestCount = 0;
    const restoreFetch = installMockFetch((url) => {
      if (!url.pathname.endsWith('/photos')) return null;
      photoUploadRequestCount += 1;
      return jsonResponse(200, {});
    });

    try {
      const galleryAddLabel = await canvas.findByText(galleryFieldConsts.GALLERY_ADD_LABEL);
      const galleryInput = galleryAddLabel.closest('.addTile')?.querySelector<HTMLInputElement>('input[type="file"]');
      if (!galleryInput) throw new Error('CourseFormPage story: gallery file input not found');

      await uploadGeneratedFileToInput(galleryInput, 800, 800);

      await expect(canvas.findByText('1 מתוך 8')).resolves.toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'הסרת תמונה 1' })).toBeInTheDocument();
      expect(photoUploadRequestCount).toBe(0);
    } finally {
      restoreFetch();
    }
  },
};
