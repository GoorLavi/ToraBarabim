import type { PickedPlace } from './models';

// A place fixture for the Storybook stories that need one (this component,
// the admin place screens): mirrors `~/rabbiFixture.ts`'s shape for the
// sibling entity. `isActive` defaults to `true`, the only value a real
// search result or duplicate-hint match ever carries; a story exercising
// State C sets it to `false` explicitly.
export const placeFixture = (place: Partial<PickedPlace> & Pick<PickedPlace, 'id' | 'name'>): PickedPlace => ({
  slug: place.id,
  street: 'רחוב הרצל 12',
  city: 'ירושלים',
  citySlug: 'ירושלים',
  area: 'jerusalem',
  isActive: true,
  ...place,
});
