import type { DedicationType } from '@torabarabim/common';
import { and, gte, isNull, lte } from 'drizzle-orm';

import { db } from '../../db/client';
import { dedications } from '../../db/schema';
import { todayInIsrael } from '../lesson/israel-time';
import type { DedicationGroupResult, ResolvedDedication } from './models';
import { dedicationRotationKey } from './rotation';

type DedicationRow = typeof dedications.$inferSelect;

const toResolvedDedication = (row: DedicationRow): ResolvedDedication => ({
  id: row.id,
  type: row.type,
  honoredName: row.honoredName,
  honorific: row.honorific ?? undefined,
  honoredGender: row.honoredGender ?? undefined,
  parentName: row.parentName ?? undefined,
  donorFamilyName: row.donorFamilyName ?? undefined,
  closingLineEnabled: row.closingLineEnabled,
});

// Fail closed on the serve condition. A row is shown only when today falls
// inside `[startsOn, endsOn]` (`endsOn` inclusive) and it has not been
// taken down: a name missing from the page for an hour is recoverable, a
// taken-down memorial still shown to a visitor is not, so any ambiguity
// here must resolve to hidden, never to shown.
export const listActive = async (now: Date): Promise<DedicationGroupResult[]> => {
  const today = todayInIsrael(now);

  const rows = await db
    .select()
    .from(dedications)
    .where(and(lte(dedications.startsOn, today), gte(dedications.endsOn, today), isNull(dedications.takenDownAt)));

  const itemsByType = new Map<DedicationType, ResolvedDedication[]>();
  for (const row of rows) {
    const resolved = toResolvedDedication(row);
    const existing = itemsByType.get(resolved.type);
    if (existing) {
      existing.push(resolved);
    } else {
      itemsByType.set(resolved.type, [resolved]);
    }
  }

  const groups: DedicationGroupResult[] = [...itemsByType.entries()].map(([type, items]) => ({
    type,
    // A deterministic per-day order, not insertion order: the same rotation
    // hash decides both this and the groups' own order below.
    items: [...items].sort((a, b) => dedicationRotationKey(a.id, now) - dedicationRotationKey(b.id, now)),
  }));

  return groups.sort((a, b) => dedicationRotationKey(a.type, now) - dedicationRotationKey(b.type, now));
};
