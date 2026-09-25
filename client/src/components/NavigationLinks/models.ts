export type NavigationProvider = 'waze' | 'googleMaps';

export interface NavigationLinksProps {
  className?: string;
  // Omitted by a caller with no approved heading of its own (CourseFacts):
  // the row still renders as the two buttons alone.
  heading?: string;
  wazeUrl: string;
  googleMapsUrl: string;
  // Each caller's own approved accessible name, never a shared default: the
  // lesson page's own fact row has no "פתיחה" label to collide with
  // ("פתיחה ב-Waze" reads fine there), but the course page's own opening-date
  // fact is itself labelled "פתיחה", so its own navigation row says "ניווט
  // ב-Waze" instead of repeating that word as a second, unrelated meaning.
  wazeAriaLabel: string;
  googleMapsAriaLabel: string;
  onNavigate?: (provider: NavigationProvider) => void;
}
