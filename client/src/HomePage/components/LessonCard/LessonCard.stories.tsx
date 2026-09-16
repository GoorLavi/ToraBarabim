import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';

import { LessonCard } from './LessonCard';

// A minimal, valid SVG portrait so the photo story never touches the network.
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

const baseLesson: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-08-20',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', title: 'דיין', photoUrl: PLACEHOLDER_PHOTO }),
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
};

const meta: Meta<typeof LessonCard> = {
  title: 'HomePage/LessonCard',
  component: LessonCard,
  args: { surface: 'general', clickContext: { surface: 'lessonsGrid', position: 0 } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '260px' }}>
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
    lesson: { ...baseLesson, rabbi: rabbiFixture({ id: 'rabbi-2', name: 'שלמה אביטן' }) },
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

export const SubstituteRabbi: Story = {
  args: {
    lesson: {
      ...baseLesson,
      substituteRabbi: rabbiFixture({ id: 'rabbi-7', name: 'אליהו וקנין', photoUrl: PLACEHOLDER_PHOTO }),
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
      place: { name: 'בית הכנסת "אור החיים"', street: 'רחוב טרומפלדור 5', city: 'באר שבע', citySlug: 'באר-שבע', area: 'south' },
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
        photoUrl: PLACEHOLDER_PHOTO,
      }),
    },
  },
};

export const VeryLongCityName: Story = {
  args: {
    lesson: {
      ...baseLesson,
      place: {
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
