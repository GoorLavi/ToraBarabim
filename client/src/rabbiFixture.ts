import type { Rabbi } from '@torabarabim/common';

// Mirrors the server's `toSlug` (server/src/service/shared/slug.ts) closely
// enough for the plain, unvocalised Hebrew display names used in these
// fixtures: any run of characters that is not a letter or a digit becomes
// one hyphen, trimmed at the edges. The client never imports the real
// function, so this can still drift from what the server actually computes;
// nothing checks that it has not.
export const rabbiSlugFromName = (name: string): string => name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

// A rabbi fixture shared by the Storybook stories that embed a rabbi
// (RabbiPage, CityPage, LessonCard, LessonsSection, LessonTicket). `slug`
// derives from `name` unless a story needs to override it, so the same
// name always produces the same slug everywhere this is used. `honorific`
// defaults to 'rav' so most callers, which are not testing the rabbanit
// case, do not have to state it.
export const rabbiFixture = (
  rabbi: Omit<Rabbi, 'slug' | 'honorific'> & Partial<Pick<Rabbi, 'slug' | 'honorific'>>,
): Rabbi => ({
  ...rabbi,
  slug: rabbi.slug ?? rabbiSlugFromName(rabbi.name),
  honorific: rabbi.honorific ?? 'rav',
});
