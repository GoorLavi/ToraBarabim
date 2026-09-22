// `POST /v1/panel/login`: the one shared login door for a rabbi or a place
// account (never an admin, refused server-side). No `role` field: an
// account's role is a server-side auth concept and never something the
// client reads or sends (see `db/schema/enums.ts`'s `ADMIN_ROLES` comment).
// `landingPath` is validated server-side from the `from` the client sent,
// so the client never has to judge for itself whether a redirect target is
// safe to follow.
export interface PanelLoginResponse {
  name: string;
  landingPath: string;
}
