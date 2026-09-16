import type { Rabbi } from '@torabarabim/common';

export interface RabbiRailAllLink {
  label: string;
  to: string;
}

export interface RabbiRailProps {
  className?: string;
  heading: string;
  rabbis: Rabbi[];
  // /women's rail carries a "לכל הרבניות" link the city page's rail never
  // had; the city page still passes nothing (design spec, section 5).
  allLink?: RabbiRailAllLink;
}
