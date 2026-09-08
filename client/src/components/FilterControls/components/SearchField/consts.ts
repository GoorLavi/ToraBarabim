export const PLACEHOLDER = 'שם של רב, בית כנסת או עיר';
export const LABEL = 'חיפוש שיעור';
export const CLEAR_LABEL = 'נקו את החיפוש';

// A full-list re-render is heavier than the CityPicker's small autocomplete
// popover, so it gets a longer debounce: enough to absorb normal typing
// speed on a phone keyboard without visibly thrashing the list, still short
// enough to feel live.
export const DEBOUNCE_MS = 350;

// Mirrors the server's `q` length limit (`GET /v1/lessons`).
export const MAX_LENGTH = 100;
