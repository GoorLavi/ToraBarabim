import type { AdminVisitorMessage } from '@torabarabim/common';
import { describe, expect, it } from 'vitest';

import { mergeUpdatedFields } from './helpers';

const base = {
  id: 'message-1',
  type: 'rabbi-request',
  name: 'דוד כהן',
  phone: '0521234567',
  message: 'הרב משה לוי מוסר שיעור בחיפה',
  createdAt: '2026-10-01T11:32:00.000Z',
} as const;

const unhandledNoNote: AdminVisitorMessage = { ...base, handlingNote: null, status: 'unhandled' };
const handledNoNote: AdminVisitorMessage = { ...base, handlingNote: null, status: 'handled', handledAt: '2026-10-01T12:00:00.000Z' };
const unhandledWithNote: AdminVisitorMessage = { ...base, handlingNote: 'שוחחנו עם הגבאי', status: 'unhandled' };

describe('mergeUpdatedFields', () => {
  it('keeps the note a concurrent note save wrote when a late toggle response predates it', () => {
    // The card already holds the saved note; the toggle's response was
    // answered before that save and carries no note.
    const merged = mergeUpdatedFields(unhandledWithNote, handledNoNote, { handled: true });

    expect(merged).toMatchObject({ status: 'handled', handlingNote: 'שוחחנו עם הגבאי' });
  });

  it('keeps the handled state a concurrent toggle wrote when a late note response predates it', () => {
    const merged = mergeUpdatedFields(handledNoNote, unhandledWithNote, { handlingNote: 'שוחחנו עם הגבאי' });

    expect(merged).toMatchObject({ status: 'handled', handlingNote: 'שוחחנו עם הגבאי' });
  });

  it('takes a cleared note from the response, as null', () => {
    const merged = mergeUpdatedFields(unhandledWithNote, unhandledNoNote, { handlingNote: '' });

    expect(merged.handlingNote).toBeNull();
  });

  it('returns a handled message to unhandled when the toggle sent false', () => {
    const merged = mergeUpdatedFields(handledNoNote, unhandledNoNote, { handled: false });

    expect(merged.status).toBe('unhandled');
  });
});
