import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { whatsAppHref } from '~/helpers';

import * as consts from './consts';
import { ShareTile } from './ShareTile';

const WIDTH_BY_NAME = { narrowest: '136px', phone: '164px', wide: '296px' } as const;

const withWidth: Decorator = (Story, { parameters }) => (
  <div style={{ inlineSize: WIDTH_BY_NAME[(parameters.tileWidth as keyof typeof WIDTH_BY_NAME | undefined) ?? 'phone'] }}>
    <Story />
  </div>
);

const meta: Meta<typeof ShareTile> = {
  title: 'HomePage/LessonRail/ShareTile',
  component: ShareTile,
  decorators: [withWidth],
  args: { onPress: fn() },
};

export default meta;
type Story = StoryObj<typeof ShareTile>;

// A plain link to WhatsApp's own contact picker: the message and the site
// address on its own line, built from constants so the server-rendered
// markup and the hydrated page agree.
export const Normal: Story = {
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: `${consts.TILE_TITLE} ${consts.TILE_BUTTON_LABEL}` });

    await expect(link).toHaveAttribute('href', whatsAppHref(consts.SHARE_MESSAGE));
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    // The click is cancelled here so the test never opens a real tab.
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const Narrowest: Story = { parameters: { tileWidth: 'narrowest' } };
export const Wide: Story = { parameters: { tileWidth: 'wide' } };

// White with the card's own border, never a tint: the lowest-effort tile
// must not be the loudest item in the row.
export const IsSurfaceWithBorder: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    const style = getComputedStyle(link);

    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};
