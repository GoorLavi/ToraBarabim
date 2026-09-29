import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { placeholderPhoto } from '~/storyMocks';
import { COURSE_GALLERY_SOFT_MIN_SIDE } from '~/consts';

import * as consts from './consts';
import { GalleryField } from './GalleryField';
import type { GalleryPhoto } from './models';

// At least 600 on the short side (the soft floor, `~/consts`,
// `COURSE_GALLERY_SOFT_MIN_SIDE`): the default fixture for every story that
// is not itself about a small photo, so a story never shows the warning by
// accident (reviewer finding, this round).
const photo = (id: string): GalleryPhoto => ({ id, url: placeholderPhoto(800, 800), status: 'uploaded' });

const meta: Meta<typeof GalleryField> = {
  title: 'components/GalleryField',
  component: GalleryField,
  args: {
    onAddFiles: fn(),
    onRemove: fn(),
    onRetry: fn(),
    isSaving: false,
  },
};

export default meta;
type Story = StoryObj<typeof GalleryField>;

export const Empty: Story = {
  args: { photos: [] },
};

export const SomePhotos: Story = {
  args: { photos: [photo('1'), photo('2'), photo('3')] },
};

export const Uploading: Story = {
  args: {
    photos: [photo('1'), photo('2'), { id: 'pending', url: placeholderPhoto(800, 800), status: 'uploading' }],
  },
};

export const UploadFailed: Story = {
  args: {
    photos: [photo('1'), { id: 'broken', url: placeholderPhoto(800, 800), status: 'failed', failureReason: consts.GALLERY_UPLOAD_FAILED_LABEL, canRetry: true }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(consts.GALLERY_UPLOAD_FAILED_LABEL)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.GALLERY_RETRY_LABEL })).toBeInTheDocument();
    // A failed tile still offers removal, the same as a saved photo's own
    // corner button: nothing else clears it from the grid (N6).
    await expect(canvas.getByRole('button', { name: consts.galleryRemoveLabel(2) })).toBeInTheDocument();
  },
};

// A rejection that will fail the same way every time it is retried (too
// small, the gallery already full): no retry button, but removal still
// clears the stuck slot.
export const UploadFailedNotRetryable: Story = {
  args: {
    photos: [{ id: 'rejected', url: placeholderPhoto(800, 800), status: 'failed', failureReason: consts.GALLERY_UPLOAD_FAILED_LABEL, canRetry: false }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: consts.GALLERY_RETRY_LABEL })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.galleryRemoveLabel(1) })).toBeInTheDocument();
  },
};

// A saved photo whose delete request failed: its own line, distinct from an
// upload's ("the gallery calls the action הסרה everywhere").
export const RemoveFailed: Story = {
  args: {
    photos: [{ id: 'photo-1', url: placeholderPhoto(800, 800), status: 'failed', failureReason: consts.GALLERY_REMOVE_FAILED_LABEL, canRetry: true }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(consts.GALLERY_REMOVE_FAILED_LABEL)).toBeInTheDocument();
  },
};

// The 8-photo cap (RabbiPanel/api.ts's own `course_photo_limit`): once
// reached, the add-tile disappears and the max-reached note takes its place,
// so a rabbi can never even attempt the request the server would refuse.
export const AtMaxPhotos: Story = {
  args: {
    photos: Array.from({ length: consts.COURSE_GALLERY_MAX_PHOTOS }, (_, index) => photo(String(index))),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(consts.GALLERY_ADD_LABEL)).not.toBeInTheDocument();
    await expect(canvas.getByText(consts.GALLERY_MAX_REACHED_NOTE)).toBeInTheDocument();
    await expect(canvas.getByText(consts.galleryCountLabel(consts.COURSE_GALLERY_MAX_PHOTOS))).toBeInTheDocument();
  },
};

// The owner's call: a small gallery photo still uploads, never rejected. A
// real photo below the soft floor, the same way the app itself finds out
// (its own tile's `<img onLoad>`, GalleryField.tsx), not a hand-set flag: a
// story that fakes the flag directly is a story that cannot catch the state
// the hook never actually produces (design gate fix round, reviewer B2).
// One warning under the whole grid, singular for exactly one marked tile.
export const SmallPhotoWarning: Story = {
  args: {
    photos: [photo('1'), { id: 'small', url: placeholderPhoto(400, 500), status: 'uploaded' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText(consts.gallerySmallPhotoWarning(1))).toBeInTheDocument());
    await expect(canvasElement.querySelectorAll('.smallRing')).toHaveLength(1);
  },
};

// Two marked tiles: the warning's own plural form, and the ring on each one
// small photo, not just the first.
export const SmallPhotoWarningPlural: Story = {
  args: {
    photos: [
      photo('1'),
      { id: 'small-1', url: placeholderPhoto(400, 500), status: 'uploaded' },
      { id: 'small-2', url: placeholderPhoto(Math.round(COURSE_GALLERY_SOFT_MIN_SIDE * 0.8), Math.round(COURSE_GALLERY_SOFT_MIN_SIDE * 0.8)), status: 'uploaded' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText(consts.gallerySmallPhotoWarning(2))).toBeInTheDocument());
    await expect(canvasElement.querySelectorAll('.smallRing')).toHaveLength(2);
  },
};

export const OneBelowMaxStillOffersAddTile: Story = {
  args: {
    photos: Array.from({ length: consts.COURSE_GALLERY_MAX_PHOTOS - 1 }, (_, index) => photo(String(index))),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(consts.GALLERY_ADD_LABEL)).toBeInTheDocument();
  },
};

// The form's own save is in flight (the create request, or the draft
// uploads after it): the add tile takes no new photos meanwhile, or one
// picked here could still be pending nobody uploads once the page has
// already navigated away (reviewer finding L1). Reuses the same disabled
// look the form's other controls already show while saving
// (PhotoPicker/styles.ts's ".chooseFile.disabled", both panels' own
// ".save:disabled"), for the designer to look at.
export const AddTileDisabledWhileSaving: Story = {
  args: {
    photos: [photo('1'), photo('2')],
    isSaving: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByText(consts.GALLERY_ADD_LABEL).closest('label')?.querySelector('input');
    if (!input) throw new Error('GalleryField story: add-tile file input not found');
    expect(input).toBeDisabled();
  },
};
