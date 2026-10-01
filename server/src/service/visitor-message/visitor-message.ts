import { desc, eq, isNotNull, isNull, sql, type SQL } from 'drizzle-orm';
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { visitorMessages } from '../../db/schema';
import telegram from '../../telegram/telegram';
import { formatVisitorMessageAlert } from './alert';
import { VisitorMessageNotFoundError } from './errors';
import type {
  CreateVisitorMessageInput,
  SubmitVisitorMessageResult,
  UpdateVisitorMessageInput,
  VisitorMessageAlertOutcome,
  VisitorMessageListQuery,
  VisitorMessageListResult,
  VisitorMessageRecord,
} from './models';

const statusCondition = (status: VisitorMessageListQuery['status']): SQL | undefined => {
  if (status === 'handled') return isNotNull(visitorMessages.handledAt);
  if (status === 'unhandled') return isNull(visitorMessages.handledAt);
  return undefined;
};

// Saves first and alerts second, so a Telegram failure can never lose a
// message. Fail-open: the alert is awaited (bounded by the client's own
// timeout) so its outcome is known and loggable under the request, but
// nothing it does can make this throw.
const sendAlert = async (record: VisitorMessageRecord): Promise<VisitorMessageAlertOutcome> => {
  try {
    return await telegram.sendMessage(formatVisitorMessageAlert(record));
  } catch (error) {
    return { failed: error };
  }
};

export const submit = async (input: CreateVisitorMessageInput): Promise<SubmitVisitorMessageResult> => {
  const [row] = await db
    .insert(visitorMessages)
    .values({ id: nanoid(), type: input.type, name: input.name, phone: input.phone, message: input.message })
    .returning();
  if (!row) throw new Error('insert into visitor_messages returned no row');

  return { id: row.id, type: row.type, alert: await sendAlert(row) };
};

export const list = async (query: VisitorMessageListQuery): Promise<VisitorMessageListResult> => {
  const condition = statusCondition(query.status);

  const [rows, totalRows, unfilteredRows] = await Promise.all([
    db
      .select()
      .from(visitorMessages)
      .where(condition)
      .orderBy(desc(visitorMessages.createdAt), desc(visitorMessages.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(visitorMessages).where(condition),
    db.select({ count: sql<number>`count(*)::int` }).from(visitorMessages),
  ]);

  return {
    items: rows,
    page: query.page,
    pageSize: query.pageSize,
    total: totalRows[0]?.count ?? 0,
    unfilteredTotal: unfilteredRows[0]?.count ?? 0,
  };
};

// One UPDATE that touches only the keys present. `handled: true` keeps an
// existing `handled_at` (a repeat is idempotent), `false` clears it, and a
// note that is empty after trimming is stored as null, never as ''.
export const update = async (id: string, patch: UpdateVisitorMessageInput): Promise<VisitorMessageRecord> => {
  const changes: PgUpdateSetSource<typeof visitorMessages> = {};
  if (patch.handled === true) changes.handledAt = sql`coalesce(${visitorMessages.handledAt}, now())`;
  if (patch.handled === false) changes.handledAt = null;
  if (patch.handlingNote !== undefined) changes.handlingNote = patch.handlingNote.trim() === '' ? null : patch.handlingNote.trim();

  const [row] = await db.update(visitorMessages).set(changes).where(eq(visitorMessages.id, id)).returning();
  if (!row) throw new VisitorMessageNotFoundError(id);
  return row;
};
