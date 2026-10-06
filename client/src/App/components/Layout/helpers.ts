import { isTextEntryElement } from '~/components/helpers';

import { OPEN_OVERLAY_SELECTOR } from './consts';

// The busy rule: anything that would interrupt the person (the install card,
// a pull to refresh) waits while a sheet, dialog or popover is open or a text
// field has focus.
export const isUserBusy = (page: Document): boolean => {
  if (page.querySelector(OPEN_OVERLAY_SELECTOR) !== null) return true;
  const focused = page.activeElement;
  return focused instanceof HTMLElement && isTextEntryElement(focused);
};
