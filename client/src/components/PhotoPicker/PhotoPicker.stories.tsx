import type { Meta, StoryObj } from '@storybook/react-vite';

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
