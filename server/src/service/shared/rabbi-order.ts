import type { RabbiProminence } from '@torabarabim/common';

// Lower rank sorts first: sought, then known, then local.
export const PROMINENCE_RANK: Record<RabbiProminence, number> = {
  sought: 0,
  known: 1,
  local: 2,
};

const collator = new Intl.Collator('he');

export interface RabbiOrderInput {
  id: string;
  name: string;
  prominence: RabbiProminence;
  hasLessons: boolean;
}

// The one ordering shared by the home row's rabbi list and the public
// rabbi directory (`rabbiService.list`): prominence tier, then whether the
// rabbi has any lesson at all, then Hebrew collation on the name, then id
// as a final tie-break. The id tie-break matters because two rabbis can
// share a name, and `/rabbis` is fetched page by page and concatenated in
// the browser, so a non-deterministic order would duplicate one rabbi and
// drop another.
export const compareRabbiOrder = (a: RabbiOrderInput, b: RabbiOrderInput): number => {
  const byProminence = PROMINENCE_RANK[a.prominence] - PROMINENCE_RANK[b.prominence];
  if (byProminence !== 0) return byProminence;

  if (a.hasLessons !== b.hasLessons) return a.hasLessons ? -1 : 1;

  const byName = collator.compare(a.name, b.name);
  if (byName !== 0) return byName;

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};
