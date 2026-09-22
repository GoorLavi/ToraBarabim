import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { placeholderPhoto } from '~/storyMocks';

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
// `height`. Built from `placeholderPhoto` itself, the same source every
// PhotoCropStep story reads, rather than a second flat-colour drawing of its
// own that could quietly drift from it (design gate round 6): a flat fill
// here gave `Landscape16x9CropStepOpen` a featureless grey rectangle to
// render, which a horizon and a corner mark let a reviewer actually judge.
//
// Rasterized to a PNG rather than handed over as the SVG `placeholderPhoto`
// itself draws: both file inputs below carry `accept="image/jpeg,image/png"`,
// which `userEvent.upload` honours by silently dropping a file whose type
// does not match, leaving the input's `files` empty and every play step that
// depends on it stuck (design gate round 7). Drawing the SVG into a canvas
// keeps `placeholderPhoto` the one source for the mock's content while still
// producing a type the picker actually accepts.
const createGeneratedImageFile = async (width: number, height: number): Promise<File> => {
  const image = new Image();
  image.src = placeholderPhoto(width, height);
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`failed to decode generated placeholder image at ${width}x${height}`));
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas 2d context unavailable while rasterizing the generated placeholder image');
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error(`canvas failed to produce a png blob at ${width}x${height}`);

  return new File([blob], 'photo.png', { type: 'image/png' });
};

const selectGeneratedFile = async (canvasElement: HTMLElement, width: number, height: number): Promise<void> => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('photo picker file input not found in canvasElement');

  // A file the `accept` filter rejects never fires `change` at all, so the
  // picker's own handler silently does nothing (design gate round 7, on
  // this exact helper). Reading `input.files` after `userEvent.upload`
  // settles is too late to catch that: the picker's own `handleChange`
  // resets `event.target.value` (and with it `.files`) as its first line, so
  // a straight post-await check reports empty even on a real upload.
  // Capturing `files.length` on the `change` event itself, before that
  // handler runs, is the assertion that actually tells the two apart.
  let receivedFileCount: number | undefined;
  const captureFileCount = (event: Event): void => {
    receivedFileCount = (event.target as HTMLInputElement).files?.length ?? 0;
  };
  input.addEventListener('change', captureFileCount, { capture: true, once: true });

  const file = await createGeneratedImageFile(width, height);
  await userEvent.upload(input, file);
  input.removeEventListener('change', captureFileCount, { capture: true });

  if (receivedFileCount !== 1) {
    throw new Error(
      `file input did not receive the generated ${width}x${height} file (accept="${input.accept}"): ${
        receivedFileCount === undefined ? 'no change event fired' : `${receivedFileCount} files`
      }`,
    );
  }
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
    // `.window`, not the pre-branch `.viewport`: the crop step's own frame
    // element was renamed and this assertion was not, so it had stopped
    // asserting anything true (design gate round 6).
    await waitFor(() => expect(document.querySelector('.window')).toBeInTheDocument());
  },
};
