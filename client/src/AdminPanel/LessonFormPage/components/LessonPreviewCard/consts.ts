import type { LessonAudience } from '@torabarabim/common';

export const PREVIEW_LABEL = 'כך זה ייראה באתר';
export const NO_RABBI_PLACEHOLDER = 'בחרו רב כדי לראות תצוגה מקדימה';
export const NO_TIME_PLACEHOLDER = '--:--';
export const NO_DAY_PLACEHOLDER = '--';

export const AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};
