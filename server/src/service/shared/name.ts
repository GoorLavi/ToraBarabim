// A rabbi's stored name is bare, never carrying its own honorific: the
// client composes "הרב <name>" / "הרבנית <name>" from `name` and
// `honorific`. Both admin-rabbi and rabbi-profile write a rabbi's name, so
// this strips one leading "הרב " or "הרבנית " (whitespace-tolerant) at
// every write site, so pasting an already-prefixed name (or migrated data
// carrying one) can never produce "הרב הרב ...".
const LEADING_HONORIFIC = /^(הרבנית|הרב)\s+/;

export const stripLeadingHonorific = (name: string): string => name.replace(LEADING_HONORIFIC, '').trim();
