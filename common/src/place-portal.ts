// The account of a logged-in place owner. Never `passwordHash`: that stays
// entirely server-side. Mirrors `RabbiSessionUser` in `rabbi-portal.ts`,
// the same one-account-per-owner shape for the other panel role.
export interface PlaceSessionUser {
  id: string;
  email: string;
  name: string;
  placeId: string;
}
