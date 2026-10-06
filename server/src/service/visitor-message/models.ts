import type { VisitorMessageType } from '@torabarabim/common';
import { z } from 'zod';

import type { visitorMessages } from '../../db/schema';
import { HELP_REQUEST_TYPES } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';
import { lessonOccurrenceParamsSchema } from '../lesson/models';
import { placeIdParamSchema } from '../place/models';
import { contactPhoneSchema } from '../shared/models';
import {
  EMPTY_UPDATE_MESSAGE,
  HANDLING_NOTE_MAX_LENGTH,
  INVALID_CURSOR_MESSAGE,
  INVALID_REQUEST_MESSAGE,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MESSAGE,
  NAME_MAX_LENGTH,
  NAME_MESSAGE,
  NOTE_TOO_LONG_MESSAGE,
  PHONE_MESSAGE,
  SUBJECT_ID_MAX_LENGTH,
} from './consts';

// `contactPhoneSchema` stays the one rule for what an Israeli mobile is and
// how it is normalised; only its wording is replaced, because the visitor
// sees this message beside the field and the shared one is written for the
// admin panel.
const visitorPhoneSchema = z.string({ error: PHONE_MESSAGE }).transform((raw, ctx) => {
  const result = contactPhoneSchema.safeParse(raw);
  if (!result.success) {
    ctx.addIssue({ code: 'custom', message: PHONE_MESSAGE });
    return z.NEVER;
  }
  return result.data;
});

const contactFields = {
  name: z.string({ error: NAME_MESSAGE }).trim().min(1, NAME_MESSAGE).max(NAME_MAX_LENGTH, NAME_MESSAGE),
  phone: visitorPhoneSchema,
  message: z.string({ error: MESSAGE_MESSAGE }).trim().min(1, MESSAGE_MESSAGE).max(MESSAGE_MAX_LENGTH, MESSAGE_MESSAGE),
};

// Shape only, no existence check: a report about a lesson deleted a minute
// ago is still worth keeping. The id and date rules are the public routes'
// own; only the id's length cap is added here.
const visitorMessageSubjectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('lesson'),
    lessonId: lessonOccurrenceParamsSchema.shape.lessonId.max(SUBJECT_ID_MAX_LENGTH),
    date: lessonOccurrenceParamsSchema.shape.date,
  }),
  z.object({ kind: z.literal('place'), placeId: placeIdParamSchema.shape.id.max(SUBJECT_ID_MAX_LENGTH) }),
]);

// `subject: z.undefined().optional()` on the help arm, not `strictObject`: a help
// request that carries a subject, null included, is a 400, while any other
// stray key is still ignored as everywhere else.
export const createVisitorMessageSchema = z.discriminatedUnion(
  'type',
  [
    z.object({ type: z.enum(HELP_REQUEST_TYPES), ...contactFields, subject: z.undefined().optional() }),
    z.object({ type: z.literal('report-mistake'), ...contactFields, subject: visitorMessageSubjectSchema }),
  ],
  { error: INVALID_REQUEST_MESSAGE },
);
export type CreateVisitorMessageInput = z.infer<typeof createVisitorMessageSchema>;

export const visitorMessageIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export interface VisitorMessageCursor {
  createdAt: Date;
  id: string;
}

// '<createdAt as ISO>|<id>'. An ISO timestamp never contains '|', so the
// first one splits it. Clients treat the string as opaque.
export const formatCursor = (record: Pick<VisitorMessageRecord, 'createdAt' | 'id'>): string =>
  `${record.createdAt.toISOString()}|${record.id}`;

const cursorSchema = z.string({ error: INVALID_CURSOR_MESSAGE }).transform((raw, ctx): VisitorMessageCursor => {
  const separator = raw.indexOf('|');
  const timestamp = raw.slice(0, separator);
  const id = raw.slice(separator + 1);
  if (separator === -1 || id === '' || !z.iso.datetime().safeParse(timestamp).success) {
    ctx.addIssue({ code: 'custom', message: INVALID_CURSOR_MESSAGE });
    return z.NEVER;
  }
  return { createdAt: new Date(timestamp), id };
});

// `all` is the default: an absent filter is not a filter. `before` is the
// previous response's `nextCursor`; absent means the newest page.
export const visitorMessageListQuerySchema = z.object({
  status: z.enum(['all', 'unhandled', 'handled']).default('all'),
  before: cursorSchema.optional(),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type VisitorMessageListQuery = z.infer<typeof visitorMessageListQuerySchema>;

// Each key is written alone, so a toggle and a note save never overwrite
// each other. A body with neither key is rejected.
export const updateVisitorMessageSchema = z
  .object({
    handled: z.boolean().optional(),
    handlingNote: z.string().trim().max(HANDLING_NOTE_MAX_LENGTH, NOTE_TOO_LONG_MESSAGE).optional(),
  })
  .refine((body) => body.handled !== undefined || body.handlingNote !== undefined, {
    message: EMPTY_UPDATE_MESSAGE,
  });
export type UpdateVisitorMessageInput = z.infer<typeof updateVisitorMessageSchema>;

export type VisitorMessageRecord = typeof visitorMessages.$inferSelect;

export type VisitorMessageAlertOutcome = 'sent' | 'skipped' | { failed: unknown };

export interface SubmitVisitorMessageResult {
  id: string;
  type: VisitorMessageType;
  alert: VisitorMessageAlertOutcome;
}

export interface VisitorMessageListResult {
  items: VisitorMessageRecord[];
  pageSize: number;
  nextCursor: string | null;
  unfilteredTotal: number;
}
