import { z } from 'zod';

// A rabbi's stored name is bare, never carrying its own honorific: the
// client composes "הרב <name>" / "הרבנית <name>" from `name` and
// `honorific`. `הרבנית` is matched before `הרב`, since the shorter
// alternative would otherwise match its own prefix and leave a stray
// "נית" behind. Applied in a loop below so a repeated prefix ("הרב הרב
// משה") or a bare honorific ("הרב") both come out right, not just the
// first repetition.
const LEADING_HONORIFIC = /^(?:הרבנית|הרב)(?:\s+|$)/;

export const stripLeadingHonorific = (name: string): string => {
  let result = name;
  while (LEADING_HONORIFIC.test(result)) {
    result = result.replace(LEADING_HONORIFIC, '');
  }
  return result.trim();
};

// The shared boundary for every rabbi name on the wire: normalizes away any
// leading honorific and then requires what is left to be non-empty, so a
// name that was only honorifics (e.g. "הרב") is a 400 ZodError rather than
// a bare "" persisted to storage.
export const rabbiNameSchema = z.string().trim().transform(stripLeadingHonorific).pipe(z.string().min(1));
