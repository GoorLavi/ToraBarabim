import type { HomeRowItem } from '@torabarabim/common';

export interface LessonRailProps {
  className?: string;
  title: string;
  items: HomeRowItem[];
  // The count behind the tile item, when this row carries one. `HomeRowItem`
  // itself carries no count (`HomeResponse.womensAreaLessonCount` is the one
  // source), so the row hands it down rather than a second copy travelling
  // on the item.
  womensAreaLessonCount: number;
}
