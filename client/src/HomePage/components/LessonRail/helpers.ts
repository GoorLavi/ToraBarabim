import type { LessonOccurrence } from '@torabarabim/common';

export type RailSlot = { kind: 'lesson'; lesson: LessonOccurrence } | { kind: 'tile' };

// The server decides the tile's position (0012: the client renders `items`
// exactly as given and never reorders them), so this only splices, never
// picks. Clamped defensively: an index the server ever sent past the end of
// its own list still renders, at the end, rather than throwing.
export const railSlots = (items: LessonOccurrence[], womensAreaTileIndex: number | undefined): RailSlot[] => {
  const slots: RailSlot[] = items.map((lesson) => ({ kind: 'lesson', lesson }));
  if (womensAreaTileIndex === undefined) return slots;

  slots.splice(Math.min(womensAreaTileIndex, slots.length), 0, { kind: 'tile' });
  return slots;
};
