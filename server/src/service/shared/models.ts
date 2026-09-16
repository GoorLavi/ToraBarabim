import type { LessonAudience, RabbiHonorific } from '@torabarabim/common';

export interface AudienceScopedLesson {
  audience: LessonAudience;
  // Always the lesson's own rabbi's honorific (`lessons.rabbiId`), never a
  // substitute's: a rabbanit never substitutes for a rav, so a substitute's
  // honorific cannot change what scope a lesson belongs to.
  teacherHonorific: RabbiHonorific;
}

export interface AudienceScopeContext {
  // Whether the search query text matched this lesson's own rabbi by name
  // (not her venue, not a city). Unset outside a search (the home rails,
  // the city rail), where the name exception never applies.
  teacherNameMatched?: boolean;
}
