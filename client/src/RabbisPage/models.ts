// `rabbis` (general scope, ravs only) is /rabbis; `rabbaniyot` (women scope,
// rabbaniyot only) is /women/rabbaniyot. One component, one copy table per
// directory (consts.ts, DIRECTORY_COPY), rather than a second page.
export type RabbiDirectory = 'rabbis' | 'rabbaniyot';

export interface RabbisPageProps {
  className?: string;
  directory: RabbiDirectory;
}

export interface DirectoryCopy {
  pageTitle: string;
  // Distinct from the header's own search field, which navigates away
  // rather than filtering this list in place: the two sit close together
  // on this page and neither was labelled (build spec, item 5).
  searchFieldLabel: string;
  searchInputAriaLabel: string;
  // Split around the query rather than one interpolated string, so the
  // component can wrap only the query itself in `dir="auto"` (a Latin name
  // must not flip the whole sentence's direction).
  noResultsHeadingPrefix: string;
  noResultsHeadingSuffix: string;
  boardEmptyHeading: string;
  boardEmptyBody: string;
  loadErrorHeading: string;
}
