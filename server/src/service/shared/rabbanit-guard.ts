import type { LessonAudience, RabbiHonorific } from '@torabarabim/common';
import { eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { rabbis } from '../../db/schema';
import { RabbanitAudienceMustBeWomenError } from './errors';

// Returns the rabbi's honorific, or `undefined` if no rabbi exists with
// that id. The honorific is set once at creation and never changes, so
// this is a plain read: there is no concurrent write to race against.
export const getRabbiHonorific = async (rabbiId: string): Promise<RabbiHonorific | undefined> => {
  const rows = await db.select({ honorific: rabbis.honorific }).from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1);
  return rows[0]?.honorific;
};

export const assertAudienceAllowedForHonorific = (
  honorific: RabbiHonorific | undefined,
  rabbiId: string,
  audience: LessonAudience,
): void => {
  if (honorific === 'rabbanit' && audience !== 'women') throw new RabbanitAudienceMustBeWomenError(rabbiId);
};

// A rabbi can only ever write his own lessons, but his own honorific can
// still be 'rabbanit', so the owner-write path needs this guard too.
export const assertAudienceAllowedForRabbi = async (rabbiId: string, audience: LessonAudience): Promise<void> => {
  if (audience === 'women') return;
  const honorific = await getRabbiHonorific(rabbiId);
  assertAudienceAllowedForHonorific(honorific, rabbiId, audience);
};
