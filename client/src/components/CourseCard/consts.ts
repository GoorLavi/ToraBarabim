// Registration open covers both `notOpen` and `open`: a seeker deciding
// whether to press "for registration" does not need the distinction a
// panel row does. The two closed reasons are their own separate strings,
// spec section 13's own words.
export const STATE_TAG_OPEN = 'ההרשמה פתוחה';
export const STATE_TAG_FULL = 'תפוסה מלאה';
export const STATE_TAG_CLOSED = 'ההרשמה נסגרה';

// Same non-breaking-space dot LessonCard's own meta line uses, so an
// audience-and-city line never wraps with the dot left dangling alone.
export const META_SEPARATOR = ' · ';

// The floor from design-system.md's card width step, mirrored from
// LessonCard/consts.ts (`CARD_WIDE_THRESHOLD`): this card is sized off the
// same rail ladder, so it steps at the same width.
export const CARD_WIDE_THRESHOLD = '190px';
