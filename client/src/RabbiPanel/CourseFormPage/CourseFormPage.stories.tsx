import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import * as courseFormFieldsConsts from '~/components/CourseFormFields/consts';
import * as galleryFieldConsts from '~/components/GalleryField/consts';
import {
  COURSE_CLOSE_REGISTRATION_ACTION_LABEL,
  COURSE_DELETE_ACTION_LABEL,
  COURSE_MARK_FULL_ACTION_LABEL,
  COURSE_VIEW_ON_SITE_ACTION_LABEL,
} from '~/consts';
import { courseResponseFixture } from '~/courseFixture';
import { rabbiFixture } from '~/rabbiFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { generatedImageFile, installMockFetch, isoDateOffsetByDays, jsonResponse, placeholderPhoto, uploadGeneratedFileToInput } from '~/storyMocks';

import { errorResolver, http, jsonResolver, loadingResolver, respondWithJson } from '../../../.storybook/apiMocks';
import type { MockResolver } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { CourseFormPage } from './CourseFormPage';

const rabbiProfile = rabbiFixture({ id: 'story-rabbi', name: 'אייל עמרמי', title: 'ראש כולל' });
const rabbaniteProfile = rabbiFixture({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit', title: 'רבנית הקהילה' });

const openCourse = courseResponseFixture({ id: 'course-1', name: 'יסודות האמונה', cycle: 3 });
// `closedOn` a week ahead of `leavesListsOn`, the course's own real order
// (design gate round 3 finding: the two had drifted to read as closing
// after it already left the lists).
const closedCourse = courseResponseFixture({
  id: 'course-2',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: isoDateOffsetByDays(0), leavesListsOn: isoDateOffsetByDays(7) },
});
const closedCourseNoLongerListed = courseResponseFixture({
  id: 'course-2-delisted',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: isoDateOffsetByDays(-14), leavesListsOn: isoDateOffsetByDays(-7) },
});
const courseWithOnePhoto = courseResponseFixture({
  id: 'course-3',
  name: 'יסודות האמונה',
  cycle: 3,
  photos: [{ id: 'photo-1', url: placeholderPhoto(200, 200) }],
});

const profileHandler = (profile = rabbiProfile) => http.get('/v1/rabbi/profile', jsonResolver(profile));
// The where-section's own `PlacePicker` mounts unconditionally (CourseFormFields.tsx),
// so every story below that reaches the real form needs this too. An edit's
// own prefilled address (city, name, street) also enables the similar-place
// hint's own query once its debounce settles, so that needs mocking too.
const placesHandler = http.get('/v1/places', jsonResolver({ items: [] }));
const similarPlacesHandler = http.get('/v1/places/similar', jsonResolver({ items: [] }));

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
  parameters: { apiMocks: { handlers: { profile: profileHandler(), places: placesHandler } } },
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
  parameters: { apiMocks: { handlers: { profile: profileHandler(rabbaniteProfile), places: placesHandler } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('נשים')).resolves.toBeInTheDocument();
    // Locked, not a live choice: the audience picker's own radiogroup never
    // renders, but the joinable-after-opening field's own pills are a
    // second, unrelated radiogroup on this same page (design gate round 2
    // finding), so the surviving one is picked by its own name rather than
    // asserting no radiogroup at all.
    await expect(canvas.findByRole('radiogroup')).resolves.toHaveAccessibleName(courseFormFieldsConsts.JOINABLE_AFTER_OPENING_LABEL);
    expect(canvas.getAllByRole('radiogroup')).toHaveLength(1);
  },
};

// An open course, loaded for edit: every section pre-filled, the gallery
// live, and all three danger-zone actions available.
export const EditModeOpen: Story = {
  decorators: [withRoute(`/courses/${openCourse.id}`)],
  parameters: {
    apiMocks: {
      handlers: {
        profile: profileHandler(),
        course: http.get('/v1/rabbi/courses/:id', jsonResolver(openCourse)),
        places: placesHandler,
        similar: similarPlacesHandler,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: consts.EDIT_HEADING })).resolves.toBeInTheDocument();
    await expect(canvas.getByDisplayValue('יסודות האמונה')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: COURSE_MARK_FULL_ACTION_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: COURSE_CLOSE_REGISTRATION_ACTION_LABEL })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: COURSE_DELETE_ACTION_LABEL })).toBeInTheDocument();
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
// `leavesListsOn` is still ahead of today: the course's own public page
// still exists, so the "view on site" link still shows.
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
    await expect(canvas.getByRole('link', { name: COURSE_VIEW_ON_SITE_ACTION_LABEL })).toBeInTheDocument();
  },
};

// `leavesListsOn` is now behind today: the course dropped off the public
// site's own lists, so there is nothing left to link to.
export const EditModeClosedNoLongerListed: Story = {
  decorators: [withRoute(`/courses/${closedCourseNoLongerListed.id}`)],
  parameters: {
    apiMocks: {
      handlers: { profile: profileHandler(), course: http.get('/v1/rabbi/courses/:id', jsonResolver(closedCourseNoLongerListed)) },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('הלכות שבת מעשיות')).resolves.toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: COURSE_VIEW_ON_SITE_ACTION_LABEL })).not.toBeInTheDocument();
  },
};

// design brief round 3, item 2: a picked gallery file, before the course
// itself exists, renders as a normal tile with no request to the photos
// endpoint, which does not exist yet for a course with no id.
export const CreateModeGalleryStaysLocalUntilSaved: Story = {
  decorators: [withRoute('/courses/new')],
  parameters: { apiMocks: { handlers: { profile: profileHandler(), places: placesHandler } } },
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

// The hook's own delete path (useCourseGalleryPhotos.ts), on an already
// saved course: removing a tile fires the real DELETE request rather than
// just dropping a local draft.
export const EditModeGalleryPhotoDeleted: Story = {
  decorators: [withRoute(`/courses/${courseWithOnePhoto.id}`)],
  parameters: {
    apiMocks: {
      handlers: {
        profile: profileHandler(),
        course: http.get('/v1/rabbi/courses/:id', jsonResolver(courseWithOnePhoto)),
        places: placesHandler,
        similar: similarPlacesHandler,
        deletePhoto: http.delete(`/v1/rabbi/courses/${courseWithOnePhoto.id}/photos/photo-1`, () => respondWithJson(undefined, 204)),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(galleryFieldConsts.galleryCountLabel(1))).resolves.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'הסרת תמונה 1' }));
    await waitFor(() => expect(canvas.getByText(galleryFieldConsts.galleryCountLabel(0))).toBeInTheDocument());
  },
};

// The hook's own multi-file add path (useCourseGalleryPhotos.ts), on an
// already saved course: `addFiles` uploads every picked file immediately,
// one request per file, and the merge-by-id fix (N5) keeps both once both
// requests resolve.
// Each of the two concurrent uploads answers with its own snapshot, the
// first not yet knowing about the second's new photo and the second not
// knowing about the first's (design gate round 3 finding: answering both
// with the same, already-merged three-photo course could not have told the
// merge-by-id fix (N5) apart from a plain overwrite).
let multiFileAddCallCount = 0;
const multiFileAddResolver: MockResolver = () => {
  multiFileAddCallCount += 1;
  const photos =
    multiFileAddCallCount === 1
      ? [
          { id: 'photo-1', url: placeholderPhoto(200, 200) },
          { id: 'photo-2', url: placeholderPhoto(200, 200) },
        ]
      : [
          { id: 'photo-1', url: placeholderPhoto(200, 200) },
          { id: 'photo-3', url: placeholderPhoto(200, 200) },
        ];
  return respondWithJson(courseResponseFixture({ ...courseWithOnePhoto, photos }));
};

export const EditModeGalleryMultiFileAdd: Story = {
  decorators: [withRoute(`/courses/${courseWithOnePhoto.id}`)],
  parameters: {
    apiMocks: {
      handlers: {
        profile: profileHandler(),
        course: http.get('/v1/rabbi/courses/:id', jsonResolver(courseWithOnePhoto)),
        places: placesHandler,
        similar: similarPlacesHandler,
        addPhoto: http.post(`/v1/rabbi/courses/${courseWithOnePhoto.id}/photos`, multiFileAddResolver),
      },
    },
  },
  play: async ({ canvasElement }) => {
    // A play reruns on every render, including Storybook's own interactive
    // re-renders, not just once per test run (design gate round 4,
    // reviewer M3): without this the second run's first call already reads
    // as call two, and the two photo sets never actually differ.
    multiFileAddCallCount = 0;

    const canvas = within(canvasElement);
    const galleryAddLabel = await canvas.findByText(galleryFieldConsts.GALLERY_ADD_LABEL);
    const galleryInput = galleryAddLabel.closest('.addTile')?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!galleryInput) throw new Error('CourseFormPage story: gallery file input not found');

    const [fileA, fileB] = await Promise.all([generatedImageFile(800, 800), generatedImageFile(800, 800)]);
    await userEvent.upload(galleryInput, [fileA, fileB]);

    await waitFor(() => expect(canvas.getByText(galleryFieldConsts.galleryCountLabel(3))).toBeInTheDocument());
  },
};
