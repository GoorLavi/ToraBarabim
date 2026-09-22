import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import * as consts from './consts';
import { PhotoPicker } from './PhotoPicker';

const portraitPhoto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>');

const landscapePhoto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="lightgray"/></svg>');

const meta: Meta<typeof PhotoPicker> = {
  title: 'components/PhotoPicker',
  component: PhotoPicker,
  args: {
    onSelectFile: () => {},
    errorMessage: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof PhotoPicker>;

// The default ratio: every rabbi's portrait poster.
export const Portrait3x4Empty: Story = {
  args: { aspectRatio: '3:4', previewUrl: undefined, hasExistingPhoto: false },
};

export const Portrait3x4WithPhoto: Story = {
  args: { aspectRatio: '3:4', previewUrl: portraitPhoto, hasExistingPhoto: true },
};

// The new ratio: a place's own photo, wider and with its own size and ratio
// requirement copy instead of the portrait's crop note.
export const Landscape16x9Empty: Story = {
  args: { aspectRatio: '16:9', previewUrl: undefined, hasExistingPhoto: false },
};

export const Landscape16x9WithPhoto: Story = {
  args: { aspectRatio: '16:9', previewUrl: landscapePhoto, hasExistingPhoto: true },
};

export const Landscape16x9RejectedFile: Story = {
  args: { aspectRatio: '16:9', previewUrl: undefined, hasExistingPhoto: false, errorMessage: 'אפשר להעלות קובץ JPG או PNG בלבד' },
};

export const Portrait3x4Uploading: Story = {
  args: { aspectRatio: '3:4', previewUrl: portraitPhoto, hasExistingPhoto: true, uploadStatus: 'uploading' },
};

export const Portrait3x4UploadFailed: Story = {
  args: { aspectRatio: '3:4', previewUrl: portraitPhoto, hasExistingPhoto: true, uploadStatus: 'failed', onRetryUpload: () => {} },
};

// A real, decodable image file, generated at runtime so the story never
// depends on a remote host (`~/storyMocks`'s own reasoning): `width` by
// `height` of flat colour is enough for the crop step to read real pixel
// dimensions from it.
const createGeneratedImageFile = async (width: number, height: number): Promise<File> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#cccccc';
    context.fillRect(0, 0, width, height);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  return new File([blob ?? new Blob()], 'photo.png', { type: 'image/png' });
};

const selectGeneratedFile = async (canvasElement: HTMLElement, width: number, height: number): Promise<void> => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) return;
  const file = await createGeneratedImageFile(width, height);
  await userEvent.upload(input, file);
};

// Picking a file that cannot yield an 800 by 450 crop at all: the crop step
// never opens, and the picker says so in place of its normal help list,
// before anyone spends time framing a photo that was always going to be
// refused (build brief).
export const Landscape16x9TooSmallToCrop: Story = {
  args: { aspectRatio: '16:9', previewUrl: undefined, hasExistingPhoto: false },
  play: async ({ canvasElement }) => {
    await selectGeneratedFile(canvasElement, 300, 200);
    await waitFor(() => expect(within(canvasElement).getByText(consts.PHOTO_TOO_SMALL_TO_CROP_ERROR)).toBeInTheDocument());
  },
};

// Picking a file large enough to crop opens the crop step, portalled over
// the whole picker: the integration this component's report calls out as
// exercised rather than merely compiled.
export const Landscape16x9CropStepOpen: Story = {
  args: { aspectRatio: '16:9', previewUrl: undefined, hasExistingPhoto: false },
  play: async ({ canvasElement }) => {
    await selectGeneratedFile(canvasElement, 1600, 1000);
    await waitFor(() => expect(document.querySelector('.viewport')).toBeInTheDocument());
  },
};
