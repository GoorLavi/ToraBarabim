import type { LessonAudience } from '@torabarabim/common';

// Fires when a create/update assigns a lesson or a course with an audience
// other than 'women' to a rabbi whose honorific is 'rabbanit'. Maps to 400.
// `audience` is the value that was actually submitted: a lesson route's own
// message does not need it, but a course route's does (spec section 13's
// "בטופס נבחר" line), so it is carried here rather than on a second, course-
// specific error class for the exact same condition.
export class RabbanitAudienceMustBeWomenError extends Error {
  constructor(
    public readonly rabbiId: string,
    public readonly audience: LessonAudience,
  ) {
    super(`Rabbi '${rabbiId}' is a rabbanit and can only teach with audience 'women', got '${audience}'`);
    this.name = 'RabbanitAudienceMustBeWomenError';
  }
}
