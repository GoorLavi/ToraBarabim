import type { HelpTileKind, HomeLessonRowId, LessonOccurrence, VisitorMessageType } from '@torabarabim/common';

export interface LessonRailProps {
  className?: string;
  // Names this row in the `Help Tile Click` event; the row's own title is
  // free text and not a stable key.
  rowId: HomeLessonRowId;
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
  // The help tile the server chose for this row and where it goes, as given
  // (never randomised here). Absent on a row that carries none.
  helpTile?: { kind: HelpTileKind; index: number };
  // Opens the one window HomeRails owns. `opener` is the pressed tile, for
  // returning focus to it on close.
  onOpenHelpTile: (kind: VisitorMessageType, opener: HTMLElement) => void;
}
