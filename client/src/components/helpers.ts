// Every focusable element still inside a dialog-shaped container, in tab
// order, so Tab can be made to cycle inside it instead of escaping it.
export const focusableElementsIn = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')).filter(
    (element) => element.tabIndex !== -1,
  );
