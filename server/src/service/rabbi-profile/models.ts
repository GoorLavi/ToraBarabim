import type { RabbiHonorific } from '@torabarabim/common';
import { z } from 'zod';

// `prominence` is never in this schema: it is an admin-only sort input and
// a rabbi must never be able to set it, not even to its current value.
// `honorific` is never in this schema either, for the same reason: only an
// admin decides whether a rabbi is a 'rav' or a 'rabbanit', since setting
// it to 'rabbanit' is gated on that rabbi's lessons (see
// `admin-rabbi.update`), a check a self-service write must not bypass.
//
// `title` and `bio` are nullable columns, so this needs three states, not
// two: omit the key to leave it as is (it is then absent from the parsed
// object, and the service's `.set({ ...input })` never mentions that
// column, which Drizzle interprets as "do not touch"); send `null` to
// clear it; send a non-empty string to set it. An empty string is
// rejected by `min(1)`, so there is exactly one way to clear a field and
// it is never confused with leaving it alone.
export const updateRabbiProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).nullable().optional(),
  bio: z.string().trim().min(1).nullable().optional(),
});
export type UpdateRabbiProfileInput = z.infer<typeof updateRabbiProfileSchema>;

export interface RabbiProfileRecord {
  id: string;
  name: string;
  honorific: RabbiHonorific;
  slug: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
}
