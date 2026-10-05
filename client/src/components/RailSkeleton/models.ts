export interface RailSkeletonProps {
  className?: string;
  // The real title (and link) when the caller already knows it, so the
  // heading paints at once and only the cards wait. Omitted, a grey bar
  // stands in for a title that is not known yet.
  heading?: { title: string; titleTo?: string };
}
