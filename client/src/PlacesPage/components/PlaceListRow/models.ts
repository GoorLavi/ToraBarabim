import type { Place } from '@torabarabim/common';

// No `position` field: unlike RabbiListRow, there is no place-click
// analytics event yet to carry it to (PlaceListRow.tsx).
export interface PlaceListRowProps {
  className?: string;
  place: Place;
}
