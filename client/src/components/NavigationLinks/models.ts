export type NavigationProvider = 'waze' | 'googleMaps';

export interface NavigationLinksProps {
  className?: string;
  // Omitted by a caller with no approved heading of its own (CourseFacts):
  // the row still renders as the two buttons alone.
  heading?: string;
  wazeUrl: string;
  googleMapsUrl: string;
  onNavigate?: (provider: NavigationProvider) => void;
}
