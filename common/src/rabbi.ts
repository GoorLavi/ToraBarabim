export interface Rabbi {
  id: string;
  name: string;
  // Derived server-side from `name` with the server's `toSlug`, for the SEO
  // URL `/rabbis/<id>/<slug>`. The client never computes one: the id, not
  // the slug, is what resolves the rabbi, so two rabbis sharing a name
  // sharing a slug is not a correctness problem.
  slug: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
}
