import type { Meta, StoryObj } from '@storybook/react-vite';

import { placeholderPhoto } from '~/storyMocks';

import { PhotoCropStep } from './PhotoCropStep';

const wideFile = new File([], 'wide.jpg', { type: 'image/jpeg' });
const nearSquareFile = new File([], 'near-square.jpg', { type: 'image/jpeg' });
const tallFile = new File([], 'tall.jpg', { type: 'image/jpeg' });
const atFloorFile = new File([], 'at-floor.jpg', { type: 'image/jpeg' });

const meta: Meta<typeof PhotoCropStep> = {
  title: 'components/PhotoPicker/PhotoCropStep',
  component: PhotoCropStep,
  args: {
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof PhotoCropStep>;

// Much wider than 16:9 (a panorama-like facade shot): the crop step's own
// floor leaves plenty of room to pan across the image and to zoom in.
export const WidePhoto: Story = {
  args: { file: wideFile, imageUrl: placeholderPhoto(2400, 1000), sourceDimensions: { width: 2400, height: 1000 } },
};

// A square-ish photo, the shape a phone camera actually produces for a
// synagogue facade (the two real photos this feature exists for): still
// clears the floor with room to frame either the width or the height.
export const NearSquarePhoto: Story = {
  args: { file: nearSquareFile, imageUrl: placeholderPhoto(1000, 1000), sourceDimensions: { width: 1000, height: 1000 } },
};

// Taller than it is wide, the orientation the old validation refused
// outright: still usable, since the crop only needs an 800-wide slice.
export const TallPhoto: Story = {
  args: { file: tallFile, imageUrl: placeholderPhoto(900, 1600), sourceDimensions: { width: 900, height: 1600 } },
};

// Exactly 800 by 450, exactly 16:9: the largest crop this photo can give is
// the whole photo, so the frame fills the viewport with no room to zoom or
// pan at all.
export const PhotoAtExactFloor: Story = {
  args: { file: atFloorFile, imageUrl: placeholderPhoto(800, 450), sourceDimensions: { width: 800, height: 450 } },
};

// A one-finger drag partway through, before it lifts: the frame off-center
// from the default, centered opening position.
export const MidDragFraming: Story = {
  args: { file: wideFile, imageUrl: placeholderPhoto(2400, 1000), sourceDimensions: { width: 2400, height: 1000 } },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) return;

    // Waits for the crop step's own `ResizeObserver` to report the
    // viewport's size before dragging it: a drag dispatched before that
    // measurement lands has nowhere to move a still-unset transform.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const rect = viewport.getBoundingClientRect();
    const startPoint = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    const endPoint = { clientX: startPoint.clientX - rect.width * 0.2, clientY: startPoint.clientY };

    viewport.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true, ...startPoint }));
    viewport.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, bubbles: true, ...endPoint }));
  },
};
