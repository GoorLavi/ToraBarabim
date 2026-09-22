import type { LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';

import { LessonTicket } from './LessonTicket';

// A minimal, valid SVG portrait so every photo story stays off the network.
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="lightgray"/></svg>',
  );

const baseOccurrence: LessonOccurrence = {
  lessonId: 'lesson-1',
  date: '2026-09-08',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', title: 'דיין', photoUrl: PLACEHOLDER_PHOTO }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
};

const meta: Meta<typeof LessonTicket> = {
  title: 'LessonPage/LessonTicket',
  component: LessonTicket,
};

export default meta;
type Story = StoryObj<typeof LessonTicket>;

export const Rich: Story = {
  args: { occurrence: baseOccurrence },
};

export const RequiredOnly: Story = {
  args: {
    occurrence: {
      lessonId: 'lesson-2',
      date: '2026-09-09',
      startTime: '19:00',
      endTime: '19:45',
      status: 'scheduled',
      audience: 'men',
      rabbi: rabbiFixture({ id: 'rabbi-4', name: 'שלמה אביטן' }),
      venue: { kind: 'address', name: 'בית מדרש אור החיים', street: 'רחוב טרומפלדור 5', city: 'באר שבע', citySlug: 'באר-שבע', area: 'south' },
    },
  },
};

export const Cancelled: Story = {
  args: {
    occurrence: {
      ...baseOccurrence,
      status: 'cancelled',
      cancellationReason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
    },
  },
};

export const CancelledNoReason: Story = {
  args: {
    occurrence: { ...baseOccurrence, status: 'cancelled' },
  },
};

export const SubstituteRabbi: Story = {
  args: {
    occurrence: {
      ...baseOccurrence,
      substituteRabbi: rabbiFixture({ id: 'rabbi-7', name: 'אליהו וקנין', photoUrl: PLACEHOLDER_PHOTO }),
    },
  },
};

export const NoPhoto: Story = {
  args: {
    // Pinned rather than left to default, now that rabbiFixture fills in a
    // placeholder photo when the key is absent (design gate finding F10):
    // this story exists specifically to show the missing-poster fallback.
    occurrence: { ...baseOccurrence, rabbi: rabbiFixture({ id: 'rabbi-2', name: 'שלמה אביטן', photoUrl: undefined }) },
  },
};

// A registered place links its name to the place page; a free-text address
// (every other story here) stays plain text (LessonTicket.tsx, `venue.kind
// === 'place'`).
export const RegisteredPlace: Story = {
  args: {
    occurrence: {
      ...baseOccurrence,
      venue: {
        kind: 'place',
        placeId: 'place-1',
        slug: 'בית-הכנסת-המרכזי',
        name: 'בית הכנסת המרכזי',
        street: 'רחוב ויצמן 45',
        city: 'נתניה',
        citySlug: 'נתניה',
        area: 'sharon',
      },
    },
  },
};

export const LongNames: Story = {
  args: {
    occurrence: {
      ...baseOccurrence,
      rabbi: rabbiFixture({
        id: 'rabbi-long',
        name: 'פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין מבית מדרשם של רבותינו הראשונים',
        title: 'ראש ישיבה וחבר בית הדין הגדול',
        photoUrl: PLACEHOLDER_PHOTO,
      }),
      venue: {
        kind: 'address',
        name: 'בית הכנסת הגדול "היכל התורה והתפילה"',
        street: 'רחוב הרב קוק הראשי 128',
        city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
        citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
        area: 'south',
      },
    },
  },
};
