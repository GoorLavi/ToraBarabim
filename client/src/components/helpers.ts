// Reads every focusable element still inside a dialog-shaped container, in
// tab order, so Tab can be made to cycle inside it instead of escaping it.
// Shared by `PanelFrame`, `DateFilterChips` and `ResponsiveSheet`, each of
// which used to carry its own near-identical copy (`PanelFrame` widened to
// inputs first, `DateFilterChips` and `ResponsiveSheet` still only read
// buttons); this is the one place all three now read from. Widened to every
// element the dedication window's own panel can hold (a link, an input, a
// button), so a caller never has to re-widen its own copy the next time a
// dialog grows a new kind of control.
export const focusableElementsIn = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')).filter(
    (element) => element.tabIndex !== -1,
  );
