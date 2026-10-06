import { STANDALONE_DISPLAY_MEDIA_QUERY } from './consts';

// Reads browser globals, so call it from an effect or an event handler, never
// while rendering: the server has no answer, and a `typeof window` guard would
// turn the missing answer into a hydration mismatch rather than fix it.
export const isStandaloneDisplay = (): boolean =>
  window.matchMedia(STANDALONE_DISPLAY_MEDIA_QUERY).matches || window.navigator.standalone === true;
