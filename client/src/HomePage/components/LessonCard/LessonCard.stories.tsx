import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useTheme } from 'styled-components';

import { rabbiFixture } from '~/rabbiFixture';
// A real portrait, not a flat rectangle: a fallback poster can only be judged
// against the kind of photograph it sits beside in a rail.
import RABBI_PORTRAIT from '~/assets/storyRabbiPortrait.webp';

import { FALLBACK_POSTERS } from './consts';
import { LessonCard } from './LessonCard';

// No token describes the width of a review rail, so this one is named here
// rather than invented inline. Deliberately a little wider than the real
// two-column phone cell: the posters are judged here, and a crop that only
// works once it is small is not judged at all.
const DEMO_CARD_WIDTH = '220px';

const baseLesson: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-08-20',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', title: 'דיין', photoUrl: RABBI_PORTRAIT }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
};

// AllFallbackPosters lays several cards side by side, so it opts out of the
// single-card width cap the other stories use. Matched on the story id, not
// `context.name`: Storybook prettifies that to "All Fallback Posters", so a
// comparison against the export name silently never matches.
const meta: Meta<typeof LessonCard> = {
  title: 'HomePage/LessonCard',
  component: LessonCard,
  args: { surface: 'general', clickContext: { surface: 'lessonsGrid', position: 0 } },
  decorators: [
    (Story, context) => (
      <div style={{ maxWidth: context.id.endsWith('--all-fallback-posters') ? undefined : '260px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LessonCard>;

export const Normal: Story = {
  args: { lesson: baseLesson },
};

export const NoPhoto: Story = {
  args: {
    // Pinned rather than left to default, now that rabbiFixture fills in a
    // placeholder photo when the key is absent (design gate finding F10):
    // this story exists specifically to show the fallback poster.
    lesson: { ...baseLesson, rabbi: rabbiFixture({ id: 'rabbi-2', name: 'שלמה אביטן', photoUrl: undefined }) },
  },
};

// Lesson ids picked (by brute force against `fallbackPosterFor`) so each of
// the six fallback posters shows exactly once here, next to one real photo.
// This is the design gate: every poster reachable, at the card's real width.
const POSTER_DEMO_LESSON_IDS = [
  'poster-demo-5',
  'poster-demo-2',
  'poster-demo-3',
  'poster-demo-0',
  'poster-demo-1',
  'poster-demo-4',
];

export const AllFallbackPosters: Story = {
  render: (args) => {
    const { spacing } = useTheme();

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
        {POSTER_DEMO_LESSON_IDS.map((lessonId) => (
          <div key={lessonId} style={{ inlineSize: DEMO_CARD_WIDTH }}>
            <LessonCard
              {...args}
              lesson={{
                ...baseLesson,
                lessonId,
                rabbi: rabbiFixture({ id: `rabbi-${lessonId}`, name: 'שלמה אביטן', photoUrl: undefined }),
              }}
            />
          </div>
        ))}
        <div style={{ inlineSize: DEMO_CARD_WIDTH }}>
          <LessonCard {...args} lesson={baseLesson} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const posters = within(canvasElement)
      .getAllByRole('link')
      .slice(0, POSTER_DEMO_LESSON_IDS.length)
      .map((card) => card.querySelector('img')?.getAttribute('src'));

    await expect(new Set(posters).size).toBe(FALLBACK_POSTERS.length);
  },
};

export const Cancelled: Story = {
  args: {
    lesson: {
      ...baseLesson,
      status: 'cancelled',
      cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
    },
  },
};

// The hard case for the cancellation label: it sits over a photograph that
// the cancelled state has already dimmed, and `poster-demo-1` is the id that
// lands on the oxblood leather cover, the poster closest to the label's own
// fill.
export const CancelledWithFallbackPoster: Story = {
  args: {
    lesson: {
      ...baseLesson,
      lessonId: 'poster-demo-1',
      status: 'cancelled',
      cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
      rabbi: rabbiFixture({ id: 'rabbi-3', name: 'שלמה אביטן', photoUrl: undefined }),
    },
  },
  play: async ({ canvasElement }) => {
    const poster = within(canvasElement).getByRole('link').querySelector('img');

    await expect(poster?.getAttribute('src')).toContain('lesson-fallback-05-leather-cover');
  },
};

export const SubstituteRabbi: Story = {
  args: {
    lesson: {
      ...baseLesson,
      substituteRabbi: rabbiFixture({ id: 'rabbi-7', name: 'אליהו וקנין', photoUrl: RABBI_PORTRAIT }),
    },
  },
};

// Both title and topic are individually optional (an admin does not always
// know the topic when entering a lesson): the meta line must fall back to
// showing only the audience, with no stray separator or empty heading.
export const MissingTitleAndTopic: Story = {
  args: {
    lesson: {
      lessonId: 'lesson-21',
      date: '2026-08-20',
      startTime: '19:00',
      endTime: '19:45',
      status: 'scheduled',
      audience: 'men',
      rabbi: rabbiFixture({ id: 'rabbi-4', name: 'שלמה אביטן' }),
      venue: { kind: 'address', name: 'בית הכנסת "אור החיים"', street: 'רחוב טרומפלדור 5', city: 'באר שבע', citySlug: 'באר-שבע', area: 'south' },
    },
  },
};

export const VeryLongRabbiName: Story = {
  args: {
    lesson: {
      ...baseLesson,
      rabbi: rabbiFixture({
        id: 'rabbi-long',
        name: 'פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין מבית מדרשם של רבותינו הראשונים',
        photoUrl: RABBI_PORTRAIT,
      }),
    },
  },
};

export const VeryLongCityName: Story = {
  args: {
    lesson: {
      ...baseLesson,
      venue: {
        kind: 'address',
        name: 'בית הכנסת הגדול "היכל התורה והתפילה"',
        street: 'רחוב הרב קוק הראשי',
        city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
        citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
        area: 'south',
      },
    },
  },
};

// On a general surface נשים renders as a chip (primarySoft fill, primary
// text and hairline), the one audience value worth calling out; it must
// wrap, never truncate.
export const GeneralSurfaceWomenChip: Story = {
  args: {
    lesson: { ...baseLesson, audience: 'women', title: undefined, topic: 'mussar' },
    surface: 'general',
  },
};

// On /women every card is already for women, so נשים reads as plain text
// there and only a mixed lesson is marked.
export const WomensAreaSurfaceMixedMarked: Story = {
  args: {
    lesson: { ...baseLesson, audience: 'mixed' },
    surface: 'womensArea',
  },
};

export const WomensAreaSurfaceWomenPlain: Story = {
  args: {
    lesson: { ...baseLesson, audience: 'women' },
    surface: 'womensArea',
  },
};
