import type { VisitorMessageType } from '@torabarabim/common';
import { z } from 'zod';

import type { visitorMessages } from '../../db/schema';
import { VISITOR_MESSAGE_TYPES } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';
import { contactPhoneSchema } from '../shared/models';
import { HANDLING_NOTE_MAX_LENGTH, MESSAGE_MAX_LENGTH, NAME_MAX_LENGTH } from './consts';

const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
const NAME_MESSAGE = 'יש למלא שם';
const PHONE_MESSAGE = 'יש למלא מספר טלפון תקין';
const MESSAGE_MESSAGE = 'יש לכתוב הודעה';

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

export const createVisitorMessageSchema = z.object({
  type: z.enum(VISITOR_MESSAGE_TYPES, { error: INVALID_REQUEST_MESSAGE }),
  name: z.string({ error: NAME_MESSAGE }).trim().min(1, NAME_MESSAGE).max(NAME_MAX_LENGTH, NAME_MESSAGE),
  phone: visitorPhoneSchema,
  message: z.string({ error: MESSAGE_MESSAGE }).trim().min(1, MESSAGE_MESSAGE).max(MESSAGE_MAX_LENGTH, MESSAGE_MESSAGE),
});
export type CreateVisitorMessageInput = z.infer<typeof createVisitorMessageSchema>;

export const visitorMessageIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

// `all` is the default: an absent filter is not a filter.
export const visitorMessageListQuerySchema = z.object({
  status: z.enum(['all', 'unhandled', 'handled']).default('all'),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type VisitorMessageListQuery = z.infer<typeof visitorMessageListQuerySchema>;

// Each key is written alone, so a toggle and a note save never overwrite
// each other. A body with neither key is rejected.
export const updateVisitorMessageSchema = z
  .object({
    handled: z.boolean().optional(),
    handlingNote: z.string().trim().max(HANDLING_NOTE_MAX_LENGTH).optional(),
  })
  .refine((body) => body.handled !== undefined || body.handlingNote !== undefined, {
    message: 'Expected at least one of handled or handlingNote, got neither',
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
  page: number;
  pageSize: number;
  total: number;
  unfilteredTotal: number;
}
