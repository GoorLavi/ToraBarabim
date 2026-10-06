// What an open sheet, dialog, popover or list box looks like in the DOM: the
// picker popovers, the pinned header's expand panel and every sheet carry one
// of these roles. The install card itself is a region, so it never matches.
export const OPEN_OVERLAY_SELECTOR = '[role="dialog"], [role="alertdialog"], [role="listbox"]';
