import type { RabbiHonorific } from '@torabarabim/common';

// Keyed by the teaching rabbi's own honorific (the substitute's, when there
// is one), so a new honorific fails the build until it is added here too.
export const ABOUT_RABBI_HEADING: Record<RabbiHonorific, string> = {
  rav: 'על מגיד השיעור',
  rabbanit: 'על מגידת השיעור',
};
export const LESSON_NOTE_HEADING = 'הערה לשיעור';
