import type { HelpRequestType } from '@torabarabim/common';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { helpTileAccessibleName } from '../../helpers';
import * as consts from './consts';
import { MessageTile } from './MessageTile';

// The rail's own item widths: 136 at a 320 screen, 164 at 375, 296 at 1280.
const WIDTH_BY_NAME = { narrowest: '136px', phone: '164px', wide: '296px' } as const;

const withWidth: Decorator = (Story, { parameters }) => (
  <div style={{ inlineSize: WIDTH_BY_NAME[(parameters.tileWidth as keyof typeof WIDTH_BY_NAME | undefined) ?? 'phone'] }}>
    <Story />
  </div>
);

const meta: Meta<typeof MessageTile> = {
  title: 'HomePage/LessonRail/MessageTile',
  component: MessageTile,
  decorators: [withWidth],
  args: { onPress: fn() },
};

export default meta;
type Story = StoryObj<typeof MessageTile>;

const pressStory = (kind: HelpRequestType, tileWidth: keyof typeof WIDTH_BY_NAME): Story => ({
  args: { kind },
  parameters: { tileWidth },
  play: async ({ canvasElement, args }) => {
    const { title, buttonLabel } = consts.MESSAGE_TILE_COPY[kind];
    const tile = within(canvasElement).getByRole('button', { name: helpTileAccessibleName(title, buttonLabel) });

    await userEvent.click(tile);

    await expect(args.onPress).toHaveBeenCalledTimes(1);
    // The pressed element comes back, so the window can return focus to it.
    await expect(args.onPress).toHaveBeenCalledWith(tile);
  },
});

export const RabbiRequest: Story = pressStory('rabbi-request', 'phone');
export const RabbiRequestNarrowest: Story = pressStory('rabbi-request', 'narrowest');
export const RabbiRequestWide: Story = pressStory('rabbi-request', 'wide');

export const Volunteer: Story = pressStory('volunteer', 'phone');
export const VolunteerNarrowest: Story = pressStory('volunteer', 'narrowest');
export const VolunteerWide: Story = pressStory('volunteer', 'wide');

// The narrowest tile drops its short line before it drops anything else, and
// never drops the title or the button-shaped pill.
export const NarrowestKeepsTitleAndPill: Story = {
  args: { kind: 'rabbi-request' },
  parameters: { tileWidth: 'narrowest' },
  play: async ({ canvasElement }) => {
    const tile = canvasElement.querySelector<HTMLElement>('button');
    if (!tile) throw new Error('MessageTile story: the tile button is missing');
    const part = (selector: string): HTMLElement => {
      const element = tile.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`MessageTile story: ${selector} is missing`);
      return element;
    };

    await expect(getComputedStyle(part('.line')).display).toBe('none');
    await expect(part('.title').getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(part('.pill').getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    // Nothing spills out of the tile.
    await expect(part('.pill').getBoundingClientRect().bottom).toBeLessThanOrEqual(tile.getBoundingClientRect().bottom);
  },
};
