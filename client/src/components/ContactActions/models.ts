export interface ContactActionsProps {
  className?: string;
  whatsAppMessage: string;
  whatsAppLabel: string;
  callLabel: string;
  // The number as an Israeli reader expects it (for the call button's
  // accessible name); `phoneInternational` drives both hrefs (`wa.me` and
  // `tel:`), the shape `whatsAppHref` and a `tel:` link both need.
  phoneDisplay: string;
  phoneInternational: string;
  onWhatsAppClick?: () => void;
  onCallClick?: () => void;
}
