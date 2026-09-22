import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';

import { LessonRail } from './LessonRail';

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
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
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
  args: { title: 'שיעורים היום', womensAreaLessonCount: 0 },
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
    scroller.scrollTo({ left: (isRtl ? -1 : 1) * maxScroll * 0.4, behavior: 'instant' });

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
