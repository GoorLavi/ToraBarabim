import type { DedicationText } from '@torabarabim/common';
import { desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { dedications } from '../../db/schema';
import type { DedicationFields } from '../dedication/models';
import { composeDedicationText } from '../dedication/text';
import { DedicationNotFoundError } from './errors';
import type {
  CreateDedicationInput,
  DedicationListQuery,
  DedicationListResult,
  DedicationRecord,
  PreviewDedicationInput,
  TakedownDedicationInput,
  UpdateDedicationInput,
} from './models';

type DedicationRow = typeof dedications.$inferSelect;

const toRecord = (row: DedicationRow): DedicationRecord => ({
  id: row.id,
  type: row.type,
  honoredName: row.honoredName,
  honorific: row.honorific ?? undefined,
  honoredGender: row.honoredGender,
  parentName: row.parentName ?? undefined,
  donorFamilyName: row.donorFamilyName ?? undefined,
  closingLineEnabled: row.closingLineEnabled,
  startsOn: row.startsOn,
  endsOn: row.endsOn,
  takenDownReason: row.takenDownReason ?? undefined,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

// A full-replacement write, matching `admin-lesson-exception`'s
// `insertValues`: an omitted optional field on the input must clear the
// column, so `undefined` and an explicit `null` both map to `null` here.
const writeValues = (input: CreateDedicationInput | UpdateDedicationInput) => ({
  type: input.type,
  honoredName: input.honoredName,
  honorific: input.honorific ?? null,
  honoredGender: input.honoredGender,
  parentName: input.parentName ?? null,
  donorFamilyName: input.donorFamilyName ?? null,
  closingLineEnabled: input.closingLineEnabled,
  startsOn: input.startsOn,
  endsOn: input.endsOn,
});

// A taken-down record is still readable here, exactly as it is through
// `list`: takedown removes a dedication from the public page
// (`listActive`, `service/dedication/dedication.ts`), never from the
// admin's own view of it.
export const getById = async (id: string): Promise<DedicationRecord> => {
  const rows = await db.select().from(dedications).where(eq(dedications.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new DedicationNotFoundError(id);
  return toRecord(row);
};

export const list = async (query: DedicationListQuery): Promise<DedicationListResult> => {
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(dedications)
      .orderBy(desc(dedications.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(dedications),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const create = async (input: CreateDedicationInput): Promise<DedicationRecord> => {
  const [row] = await db
    .insert(dedications)
    .values({ id: nanoid(), ...writeValues(input) })
    .returning();
  if (!row) throw new Error('insert into dedications returned no row');
  return toRecord(row);
};

export const update = async (id: string, input: UpdateDedicationInput): Promise<DedicationRecord> => {
  const [row] = await db
    .update(dedications)
    .set({ ...writeValues(input), updatedAt: new Date() })
    .where(eq(dedications.id, id))
    .returning();
  if (!row) throw new DedicationNotFoundError(id);
  return toRecord(row);
};

// Pulls a dedication from public view. `takenDownAt` and `takenDownReason`
// are set together (the `dedications_takedown_reason` CHECK constraint), so
// the record stays readable through the rest of the admin API for its own
// history, while `listActive` (`service/dedication/dedication.ts`) fails
// closed on `takenDownAt` and stops serving it.
export const takedown = async (id: string, input: TakedownDedicationInput): Promise<DedicationRecord> => {
  const [row] = await db
    .update(dedications)
    .set({ takenDownAt: new Date(), takenDownReason: input.reason, updatedAt: new Date() })
    .where(eq(dedications.id, id))
    .returning();
  if (!row) throw new DedicationNotFoundError(id);
  return toRecord(row);
};

// A preview draft is never invalid for being incomplete: only `type` is
// required by `previewDedicationSchema`, so every other field is filled in
// with a placeholder that the composer can safely ignore. `honoredGender`
// is never guessed when it is genuinely absent: `parentName` is dropped
// alongside it, rather than composing a parent line with a gender the
// admin has not chosen yet, which would silently pick בן or בת for them.
const draftFields = (input: PreviewDedicationInput): DedicationFields => ({
  type: input.type,
  honoredName: input.honoredName ?? '',
  honorific: input.honorific ?? undefined,
  honoredGender: input.honoredGender ?? 'male',
  parentName: input.honoredGender ? input.parentName : undefined,
  donorFamilyName: input.donorFamilyName,
  closingLineEnabled: input.closingLineEnabled ?? false,
});

export const previewText = (input: PreviewDedicationInput): DedicationText => composeDedicationText(draftFields(input));
