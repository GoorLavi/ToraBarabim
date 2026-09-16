import type { LessonOccurrence } from '@torabarabim/common';

export interface LessonRailProps {
  className?: string;
  title: string;
  items: LessonOccurrence[];
  // The 0-based index within `items` the server wants the women's-area tile
  // spliced at; absent on a row that carries none.
  womensAreaTileIndex?: number;
  // The count behind the tile, when this row carries one. `LessonOccurrence`
  // itself carries no count (`HomeResponse.womensAreaLessonCount` is the one
  // source), so the row hands it down rather than a second copy travelling
  // on the item.
  womensAreaLessonCount: number;
}
