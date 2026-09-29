import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { uploadGeneratedFileToInput } from '~/storyMocks';

import * as consts from './consts';
import * as helpers from './helpers';
import { PhotoPicker } from './PhotoPicker';

const RATIO_3X4 = { aspectRatio: '3:4' as const, minWidth: consts.RABBI_PHOTO_MIN_WIDTH, minHeight: consts.RABBI_PHOTO_MIN_HEIGHT };
const RATIO_16X9 = { aspectRatio: '16:9' as const, minWidth: consts.PLACE_PHOTO_MIN_WIDTH, minHeight: consts.PLACE_PHOTO_MIN_HEIGHT };

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
  args: { ...RATIO_3X4, previewUrl: undefined, hasExistingPhoto: false },
};

export const Portrait3x4WithPhoto: Story = {
  args: { ...RATIO_3X4, previewUrl: portraitPhoto, hasExistingPhoto: true },
};

// The new ratio: a place's own photo, wider and with its own size and ratio
// requirement copy instead of the portrait's crop note.
export const Landscape16x9Empty: Story = {
  args: { ...RATIO_16X9, previewUrl: undefined, hasExistingPhoto: false },
};

export const Landscape16x9WithPhoto: Story = {
  args: { ...RATIO_16X9, previewUrl: landscapePhoto, hasExistingPhoto: true },
};

export const Landscape16x9RejectedFile: Story = {
  args: { ...RATIO_16X9, previewUrl: undefined, hasExistingPhoto: false, errorMessage: 'אפשר להעלות קובץ JPG או PNG בלבד' },
};

export const Portrait3x4Uploading: Story = {
  args: { ...RATIO_3X4, previewUrl: portraitPhoto, hasExistingPhoto: true, uploadStatus: 'uploading' },
};

export const Portrait3x4UploadFailed: Story = {
  args: { ...RATIO_3X4, previewUrl: portraitPhoto, hasExistingPhoto: true, uploadStatus: 'failed', onRetryUpload: () => {} },
};

const selectGeneratedFile = async (canvasElement: HTMLElement, width: number, height: number): Promise<void> => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('photo picker file input not found in canvasElement');
  await uploadGeneratedFileToInput(input, width, height);
};

// Decodes a file this story received back from `onSelectFile`, to assert on
// its own real pixel dimensions rather than trust the code path was taken.
const decodeFileDimensions = async (file: File): Promise<{ width: number; height: number }> => {
  const { objectUrl, width, height } = await helpers.decodeImageFile(file);
  URL.revokeObjectURL(objectUrl);
  return { width, height };
};

// '3:4' has no crop step of its own, so an oversized phone photo is
// re-encoded whole on selection instead (PhotoPicker.tsx): the file
// `onSelectFile` receives is capped at `CROP_OUTPUT_MAX_LONG_SIDE` on its
// own long side, never the 3000 by 4000 source.
export const Portrait3x4OversizedFileReencoded: Story = {
  args: { ...RATIO_3X4, previewUrl: undefined, hasExistingPhoto: false, onSelectFile: fn() },
  play: async ({ canvasElement, args }) => {
    await selectGeneratedFile(canvasElement, 3000, 4000);
    await waitFor(() => expect(args.onSelectFile).toHaveBeenCalled());

    const [selectedFile] = (args.onSelectFile as ReturnType<typeof fn>).mock.calls[0] as [File];
    const dimensions = await decodeFileDimensions(selectedFile);
    expect(Math.max(dimensions.width, dimensions.height)).toBeLessThanOrEqual(consts.CROP_OUTPUT_MAX_LONG_SIDE);
  },
};

// Picking a file that cannot yield an 800 by 450 crop at all: the crop step
// never opens, and the picker says so in place of its normal help list,
// before anyone spends time framing a photo that was always going to be
// refused (build brief).
export const Landscape16x9TooSmallToCrop: Story = {
  args: { ...RATIO_16X9, previewUrl: undefined, hasExistingPhoto: false },
  play: async ({ canvasElement }) => {
    await selectGeneratedFile(canvasElement, 300, 200);
    await waitFor(() =>
      expect(within(canvasElement).getByText(helpers.photoTooSmallError(RATIO_16X9.minWidth, RATIO_16X9.minHeight))).toBeInTheDocument(),
    );
  },
};

// Picking a file large enough to crop opens the crop step, portalled over
// the whole picker: the integration this component's report calls out as
// exercised rather than merely compiled.
export const Landscape16x9CropStepOpen: Story = {
  args: { ...RATIO_16X9, previewUrl: undefined, hasExistingPhoto: false },
  play: async ({ canvasElement }) => {
    await selectGeneratedFile(canvasElement, 1600, 1000);
    // `.window`, not the pre-branch `.viewport`: the crop step's own frame
    // element was renamed and this assertion was not, so it had stopped
    // asserting anything true (design gate round 6).
    await waitFor(() => expect(document.querySelector('.window')).toBeInTheDocument());
  },
};
