import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { placeholderPhoto } from '~/storyMocks';

import * as consts from './consts';
import { GalleryField } from './GalleryField';
import type { GalleryPhoto } from './models';

const photo = (id: string): GalleryPhoto => ({ id, url: placeholderPhoto(200, 200), status: 'uploaded' });

const meta: Meta<typeof GalleryField> = {
  title: 'components/GalleryField',
  component: GalleryField,
  args: {
    onAddFiles: fn(),
    onRemove: fn(),
    onRetry: fn(),
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
    photos: [photo('1'), photo('2'), { id: 'pending', url: placeholderPhoto(200, 200), status: 'uploading' }],
  },
};

export const UploadFailed: Story = {
  args: {
    photos: [photo('1'), { id: 'broken', url: placeholderPhoto(200, 200), status: 'failed', failureReason: consts.GALLERY_UPLOAD_FAILED_LABEL, canRetry: true }],
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
    photos: [{ id: 'rejected', url: placeholderPhoto(200, 200), status: 'failed', failureReason: consts.GALLERY_UPLOAD_FAILED_LABEL, canRetry: false }],
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
    photos: [{ id: 'photo-1', url: placeholderPhoto(200, 200), status: 'failed', failureReason: consts.GALLERY_REMOVE_FAILED_LABEL, canRetry: true }],
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

export const OneBelowMaxStillOffersAddTile: Story = {
  args: {
    photos: Array.from({ length: consts.COURSE_GALLERY_MAX_PHOTOS - 1 }, (_, index) => photo(String(index))),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(consts.GALLERY_ADD_LABEL)).toBeInTheDocument();
  },
};
