import type { RabbiHonorific } from '@torabarabim/common';

// Not `LessonPage/components/RabbiBio/consts.ts`'s own
// `ABOUT_RABBI_HEADING`: that one reads "על מגיד השיעור" for a rav,
// approved for the lesson page specifically. The course page's own approved
// heading is "על הרב" (spec section 13), a different string for the same
// honorific, so this is its own record rather than a shared import.
export const ABOUT_TEACHER_HEADING: Record<RabbiHonorific, string> = {
  rav: 'על הרב',
  rabbanit: 'על הרבנית',
};
