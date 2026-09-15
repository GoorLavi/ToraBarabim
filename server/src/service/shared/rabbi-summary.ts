import type { Rabbi, RabbiHonorific } from '@torabarabim/common';

import { toSlug } from './slug';

// The columns every producer of a wire `Rabbi` reads from a `rabbis` row,
// whether the row is the full `rabbis.$inferSelect` shape or a narrower
// `Pick` of it: nullable, matching the database column, never optional.
export interface RabbiSummaryRow {
  id: string;
  name: string;
  honorific: RabbiHonorific;
  title: string | null;
  photoUrl: string | null;
  bio: string | null;
}

// The one place a `rabbis` row becomes a wire `Rabbi`. Five call sites
// (the rabbi directory, the city directory, the home rails, the lesson
// search, and a rabbi's own upcoming occurrences) built this by hand with
// the same five fields before this existed; this is that second-caller
// threshold, not speculation.
export const toRabbiSummary = (row: RabbiSummaryRow): Rabbi => ({
  id: row.id,
  name: row.name,
  honorific: row.honorific,
  // `title` is a role ('ראש ישיבה', 'דיין'), not part of the rabbi's
  // identity, so it stays out of the slug; the id, not the slug, is what
  // resolves the rabbi, so a name that collapses to '' after `toSlug`
  // strips every character falls back to the id rather than producing an
  // empty URL segment.
  slug: toSlug(row.name) || row.id,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});
