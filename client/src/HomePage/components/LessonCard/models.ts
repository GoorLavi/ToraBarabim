import type { LessonOccurrence } from '@torabarabim/common';

// 'general' is every public surface outside the women's area: the audience
// line marks נשים as a chip there, since it is the one value worth calling
// out. 'womensArea' is /women, where every card is already for women, so
// נשים reads as plain text and only a mixed lesson is marked.
export type LessonCardSurface = 'general' | 'womensArea';

// The audience line's three renderings (helpers.ts, audienceTreatment).
export type AudienceTreatment = 'plain' | 'marked' | 'chip';

export interface LessonCardProps {
  className?: string;
  lesson: LessonOccurrence;
  surface: LessonCardSurface;
}
