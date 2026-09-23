import { slugFromName } from '~/storyMocks';

import type { PickedPlace } from './models';

// A place fixture for the Storybook stories that need one (this component,
// the admin place screens): mirrors `~/rabbiFixture.ts`'s shape for the
// sibling entity, including deriving the slug from the name rather than
// standing the id in for it. The server derives a place's slug the same
// way and falls back to the id only when the name slugs to nothing
// (`db/seed/places.ts`), so an id-shaped slug is a URL no real place has,
// and a story built on one cannot show a slug-related defect. `isActive`
// defaults to `true`, the only value a real search result or duplicate-hint
// match ever carries; a story exercising State C sets it to `false`
// explicitly.
export const placeFixture = (place: Partial<PickedPlace> & Pick<PickedPlace, 'id' | 'name'>): PickedPlace => ({
  slug: slugFromName(place.name) || place.id,
  street: 'רחוב הרצל 12',
  city: 'ירושלים',
  citySlug: 'ירושלים',
  area: 'jerusalem',
  isActive: true,
  ...place,
});
