import type { Dedication, DedicationGroup } from '@torabarabim/common';

// Split out of helpers.ts deliberately: everything else there carries a
// type-only import through the `~` alias (`~/hooks/models`), which only
// Vite resolves. server/test/dedication-band.test.ts imports this pair by
// relative path, the same cross-workspace shape client/src/routes/
// home.server.ts already uses in the other direction, and needs a module
// whose own import graph never touches that alias, directly or through a
// sibling export in the same file.

// Weighted per dedication, never per type: drawing the type uniformly would
// make a group of one appear as often as a group of twenty, so the one
// dedication in it would be seen twenty times more often than each of the
// twenty (design-system.md, dedication "The draw"). `random` is a
// parameter, never a bare `Math.random()` call, so this stays callable from
// a test with a controlled generator. `undefined` on an empty pool.
export const drawDedication = (groups: DedicationGroup[], random: () => number): Dedication | undefined => {
  const allItems = groups.flatMap((group) => group.items);
  if (allItems.length === 0) return undefined;

  // Clamped defensively: `random` is a caller-supplied function, not the
  // engine's own `Math.random()`, which the language spec guarantees never
  // reaches 1.
  const index = Math.min(Math.floor(random() * allItems.length), allItems.length - 1);
  return allItems[index];
};

// Draws one dedication (above), then returns that dedication's whole type
// group, so both band placements show the same group and never a mix
// (design-system.md, dedication rule 3). `undefined` on an empty pool,
// which both placements render as nothing at all, never an empty band.
export const drawDedicationGroup = (groups: DedicationGroup[], random: () => number): DedicationGroup | undefined => {
  const drawn = drawDedication(groups, random);
  if (!drawn) return undefined;

  return groups.find((group) => group.items.some((item) => item.id === drawn.id));
};
