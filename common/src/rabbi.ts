export type RabbiHonorific = 'rav' | 'rabbanit';

export interface Rabbi {
  id: string;
  // The bare name, never carrying an honorific ("אייל עמרמי", not "הרב אייל
  // עמרמי"): the client composes the display form from `name` and
  // `honorific`.
  name: string;
  honorific: RabbiHonorific;
  // Derived server-side from `name` with the server's `toSlug`, falling
  // back to `id` when that comes out empty, for the SEO URL
  // `/rabbis/<id>/<slug>`. Never empty. The client never computes one: the
  // id, not the slug, is what resolves the rabbi, so two rabbis sharing a
  // name sharing a slug is not a correctness problem.
  slug: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
}
