// Reads focusable buttons and inputs still inside the panel, in tab order,
// so Tab can be made to cycle inside the dialog instead of escaping it
// (mirrors DateFilterChips.tsx's own `focusableButtonsIn`, extended to
// inputs since a panel's search field, where one exists, is itself a stop).
export const focusableElementsIn = (panel: HTMLElement): HTMLElement[] =>
  Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')).filter(
    (element) => element.tabIndex !== -1,
  );
