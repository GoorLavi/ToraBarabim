// The one place a rabbi's public path is built, from the id React Router
// matches on and the slug that decorates it for a reader and for search
// results. Hebrew is not ASCII on the wire, so the slug segment is
// percent-encoded here; the id and the slug are never encoded a second time
// by a caller.
export const rabbiPagePath = (id: string, slug: string): string =>
  `/rabbis/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`;
