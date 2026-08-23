import type { LessonAudience } from '@torabarabim/common';

// Never say `מעורב`: see .claude/design-system.md, Audience wording.
export const AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};
