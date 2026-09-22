import type { Rabbi } from '@torabarabim/common';

import { placeholderPhoto } from '~/storyMocks';

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
// case, do not have to state it. `photoUrl` defaults to a placeholder photo
// for the same reason: every rabbi has a poster in the real product
// (docs/product.md), so a story that never mentions `photoUrl` should not
// silently exercise the no-photo fallback on every card it renders. A story
// that exists to show that fallback still can, by passing `photoUrl:
// undefined` explicitly rather than omitting the key: `'photoUrl' in rabbi`
// tells the two apart, where `??` on the value could not (design gate
// finding F10).
export const rabbiFixture = (
  rabbi: Omit<Rabbi, 'slug' | 'honorific'> & Partial<Pick<Rabbi, 'slug' | 'honorific'>>,
): Rabbi => ({
  ...rabbi,
  slug: rabbi.slug ?? rabbiSlugFromName(rabbi.name),
  honorific: rabbi.honorific ?? 'rav',
  photoUrl: 'photoUrl' in rabbi ? rabbi.photoUrl : placeholderPhoto(900, 1200),
});
