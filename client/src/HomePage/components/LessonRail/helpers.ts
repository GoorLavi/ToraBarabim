import type { HelpTileKind, LessonOccurrence } from '@torabarabim/common';

export type RailSlot =
  | { kind: 'lesson'; lesson: LessonOccurrence }
  | { kind: 'womensArea' }
  | { kind: 'help'; helpKind: HelpTileKind };

interface Insertion {
  index: number;
  slot: RailSlot;
}

// The server decides every tile's position (0012: the client renders `items`
// exactly as given and never reorders or randomises them), so this only
// splices, never picks. Indices are positions in `items`, so the insertions
// run from the highest down: an earlier splice must not shift the position
// of one still to come. Each index is clamped defensively: one the server
// ever sent past the end of its own list still renders, at the end, rather
// than throwing.
export const railSlots = (
  items: LessonOccurrence[],
  womensAreaTileIndex: number | undefined,
  helpTile: { kind: HelpTileKind; index: number } | undefined,
): RailSlot[] => {
  const slots: RailSlot[] = items.map((lesson) => ({ kind: 'lesson', lesson }));

  const insertions: Insertion[] = [];
  if (womensAreaTileIndex !== undefined) insertions.push({ index: womensAreaTileIndex, slot: { kind: 'womensArea' } });
  if (helpTile) insertions.push({ index: helpTile.index, slot: { kind: 'help', helpKind: helpTile.kind } });

  for (const { index, slot } of insertions.sort((a, b) => b.index - a.index)) {
    slots.splice(Math.min(index, items.length), 0, slot);
  }
  return slots;
};
