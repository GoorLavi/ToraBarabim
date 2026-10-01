import type { HelpTileKind, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { whatsAppHref } from '~/helpers';
import { rabbiFixture } from '~/rabbiFixture';
import { atFrameSize } from '~/storyMocks';

import { LessonRail } from './LessonRail';
import * as messageTileConsts from './components/MessageTile/consts';
import * as shareTileConsts from './components/ShareTile/consts';

const baseLesson: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-08-20',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', title: 'דיין' }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
};

// Enough cards that the row overflows at any realistic Storybook canvas
// width: the card width is derived from the real viewport (helpers.ts,
// railCardWidth reads `100vw`), not from a wrapping decorator, so making the
// row overflow reliably is a matter of item count, not a fixed-width wrapper.
// 12 items, the row's own cap (`MAX_ITEMS_PER_ROW`, server/src/service/home/consts.ts),
// so these stories also exercise the phone-width card peek at the widest a
// real row ever gets.
const manyItems: LessonOccurrence[] = Array.from({ length: 12 }, (_, index) => ({
  ...baseLesson,
  lessonId: `lesson-${index + 1}`,
  rabbi: rabbiFixture({ id: `rabbi-${index + 1}`, name: `רב מספר ${index + 1}` }),
}));

const oneItem: LessonOccurrence[] = [baseLesson];

const meta: Meta<typeof LessonRail> = {
  title: 'HomePage/LessonRail',
  component: LessonRail,
  args: { rowId: 'today', title: 'שיעורים היום', womensAreaLessonCount: 0, onOpenHelpTile: fn() },
};

export default meta;
type Story = StoryObj<typeof LessonRail>;

// The row at rest: never scrolled. Viewed at a phone canvas width (below
// `md`), this is the state that shows the real card peek at the row's
// scrolling edge: the row's own gap between cards is `sm` there while the
// card's own width still assumes a `lg` grid gap, so closing the gap up
// hands the difference back as a sliver of the next card (design-system.md,
// "Horizontal rails").
export const AtRest: Story = {
  args: { items: manyItems },
};

const getScroller = (canvasElement: HTMLElement): HTMLElement => {
  // No accessible role identifies the scroller itself (LessonRail.tsx);
  // the class name is the only handle to it from a story.
  const scroller = canvasElement.querySelector<HTMLElement>('.scrollerGroup');
  if (!scroller) throw new Error('LessonRail story: `.scrollerGroup` not found, the scroller markup or class name has changed');
  return scroller;
};

// Scrolled partway: demonstrates that the row itself actually scrolls, by
// checking the scroller's own `scrollLeft` moved off its resting position
// after `scrollTo`, rather than trusting the call succeeded silently.
export const PartiallyScrolled: Story = {
  args: { items: manyItems },
  play: async ({ canvasElement }) => {
    const scroller = getScroller(canvasElement);

    const restingScrollLeft = scroller.scrollLeft;
    const isRtl = getComputedStyle(scroller).direction === 'rtl';
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: (isRtl ? -1 : 1) * maxScroll * 0.4, behavior: 'auto' });

    await waitFor(() => {
      expect(scroller.scrollLeft).not.toEqual(restingScrollLeft);
    });
  },
};

// One card never overflows its own row: there is nothing to scroll.
export const FitsWithoutOverflow: Story = {
  args: { items: oneItem },
  play: async ({ canvasElement }) => {
    const scroller = getScroller(canvasElement);

    expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
  },
};

// The rendered items of the row, in order: the way to ask "which slot is this
// in" without trusting anything but the DOM.
const getSlots = (canvasElement: HTMLElement): HTMLElement[] => {
  const scroller = canvasElement.querySelector<HTMLElement>('.scroller');
  if (!scroller) throw new Error('LessonRail story: `.scroller` not found, the scroller markup or class name has changed');
  return Array.from(scroller.children) as HTMLElement[];
};

// The tile may be stretched to the row, but it must never be what makes the
// row tall: with the stretch switched off, so every item takes its own
// natural height, the tile is no taller than the lesson card beside it.
const expectTileNotTallerThanCard = (canvasElement: HTMLElement, tileSlotIndex: number): void => {
  const scroller = canvasElement.querySelector<HTMLElement>('.scroller');
  const slots = getSlots(canvasElement);
  const tile = slots[tileSlotIndex];
  const card = slots[tileSlotIndex - 1];
  if (!scroller || !tile || !card) throw new Error('LessonRail story: the tile or the card beside it is missing');

  const previousAlignItems = scroller.style.alignItems;
  scroller.style.alignItems = 'flex-start';
  const tileHeight = tile.getBoundingClientRect().height;
  const cardHeight = card.getBoundingClientRect().height;
  scroller.style.alignItems = previousAlignItems;

  expect(tileHeight).toBeLessThanOrEqual(cardHeight);
};

// Every width the rail changes card size at, narrowest phone to wide desktop.
const RAIL_WIDTHS = [320, 375, 768, 1280] as const;

const HELP_TILE_SLOT = 3;

const helpTileStory = (kind: HelpTileKind, index: number = HELP_TILE_SLOT): Story => ({
  args: { items: manyItems, helpTile: { kind, index } },
  play: async ({ canvasElement, args }) => {
    const slot = getSlots(canvasElement)[index];
    if (!slot) throw new Error(`LessonRail story: no slot at index ${index}`);

    // At the payload's own slot, as given.
    if (kind === 'share') {
      await expect(within(slot).getByRole('link')).toHaveAttribute('href', whatsAppHref(shareTileConsts.SHARE_MESSAGE));
    } else {
      const { title, buttonLabel } = messageTileConsts.MESSAGE_TILE_COPY[kind];
      await expect(within(slot).getByRole('button', { name: `${title} ${buttonLabel}` })).toBeInTheDocument();
    }
    await expect(args.items).toHaveLength(12);

    for (const width of RAIL_WIDTHS) {
      await atFrameSize(width, undefined, async () => expectTileNotTallerThanCard(canvasElement, index));
    }
  },
});

export const WithRabbiRequestTile: Story = helpTileStory('rabbi-request');
export const WithVolunteerTile: Story = helpTileStory('volunteer');
export const WithShareTile: Story = helpTileStory('share');

// `index = items.length` means after the last card.
export const HelpTileAtLastSlot: Story = helpTileStory('rabbi-request', manyItems.length);

// A row carrying the women's-area tile never carries a help tile: the server
// places them in different rows, so this row shows the women's tile alone.
export const WomensAreaRowHasNoHelpTile: Story = {
  args: { items: manyItems, womensAreaTileIndex: 2, womensAreaLessonCount: 12 },
  play: async ({ canvasElement }) => {
    const slots = getSlots(canvasElement);
    await expect(slots).toHaveLength(manyItems.length + 1);
    await expect(within(slots[2] as HTMLElement).getByRole('link')).toHaveAttribute('href', '/women');
    await expect(within(canvasElement).queryAllByRole('button', { name: /בקשה להוספה|הצטרפות למתנדבים/ })).toHaveLength(0);
  },
};

// The share tile is white with the card's own border and shadow, in a real
// row beside a lesson card: the same look as the card, never a tint.
export const ShareTileSurfaceBordered: Story = {
  args: { items: manyItems, helpTile: { kind: 'share', index: 1 } },
  play: async ({ canvasElement }) => {
    for (const width of [375, 1280]) {
      await atFrameSize(width, undefined, async () => {
        const [firstSlot, shareSlot] = getSlots(canvasElement);
        const card = firstSlot?.querySelector('a');
        const tile = shareSlot?.querySelector('a');
        if (!card || !tile) throw new Error('LessonRail story: the card or the share tile is missing');

        const cardStyle = getComputedStyle(card);
        const tileStyle = getComputedStyle(tile);
        await expect(tileStyle.backgroundColor).toBe(cardStyle.backgroundColor);
        await expect(tileStyle.borderTopColor).toBe(cardStyle.borderTopColor);
        await expect(tileStyle.borderTopWidth).toBe(cardStyle.borderTopWidth);
        await expect(tileStyle.boxShadow).toBe(cardStyle.boxShadow);
      });
    }
  },
};
