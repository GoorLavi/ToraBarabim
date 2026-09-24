import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import { focusableElementsIn } from '~/components/helpers';

import type { ResponsiveSheetProps } from './models';
import * as styles from './styles';

// Portalled into `document.body`. `PinnedHeaderBar` carries `transform:
// translateY(...)` in both its states, and a transformed ancestor becomes
// the containing block for a `position: fixed` descendant: without the
// portal, a sheet opened from inside that bar (FilterFieldsGrid renders
// there below `lg`) would cover only the bar's own box instead of the
// viewport. `document` does not exist during server rendering, but this
// component only ever renders after an interaction, so it is never part of
// the server output; the guard below makes that true by construction rather
// than by luck. The portal moves only the DOM node, not the React tree, so
// the styled-components theme context (and any other context) still reaches
// `.panel` and its children normally, and React's own synthetic events keep
// bubbling by React-tree order rather than DOM order: a caller's own
// ancestor handler (DateFilterChips's `calendarWrapper`, for instance)
// still sees an event that started inside `.panel`.
export const ResponsiveSheet = styled(({ className, ariaLabel, onDismiss, children }: ResponsiveSheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus-in-on-open: the panel itself, per the plan (1.3, option A), not
  // its first focusable descendant, since the first descendant in a sheet
  // like `DiscardChangesSheet` is its destructive action, and a keyboard
  // user who opens the sheet and presses Enter must never throw their own
  // edit away by doing nothing but accepting where focus already was. This
  // component only ever mounts while the sheet is open (there is no
  // `isOpen` prop to key an effect on), so a plain mount effect *is* "once
  // per open". Skipped when focus already sits inside the panel, which is
  // what keeps a picker's own autofocused search input (CityPickerPanel,
  // SearchSelect) its focus rather than losing it to the panel a beat
  // later: a descendant's own mount effect always runs before an
  // ancestor's in the same commit, so by the time this runs, a
  // self-focusing child has already claimed it (the city-picker guard).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.contains(document.activeElement)) return;
    panel.focus();
  }, []);

  // The Tab trap reacts to `keydown` Tab only: never `focusout`, `focusin`,
  // `blur` or a pointer event, and never moves focus in response to any of
  // those (the city-picker guard, a36eaba: that is exactly the Safari trap
  // this codebase already shipped and fixed once).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      // Never `stopPropagation`, only `defaultPrevented`: a popover nested
      // inside this sheet (`useDismissPopover.ts`, the SearchSelect-in-a-
      // sheet case `MoveExceptionSheet`'s `CitySelect` is the real caller
      // of) owns Escape in the capture phase and calls `preventDefault()`
      // when it closes itself, so by the time this bubble-phase handler
      // runs, an Escape already claimed by something inside is a no-op
      // here. This handler does the same for whatever sits above it.
      if (event.defaultPrevented) return;
      event.preventDefault();
      onDismiss();
      return;
    }

    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = focusableElementsIn(panel);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    // Focus opens on the panel itself, not on `first` (above), so
    // shift+Tab from there has to wrap the same way it would from `first`:
    // otherwise the panel, sitting outside the normal tab sequence
    // (`tabIndex={-1}`), lets shift+Tab fall back to whatever precedes this
    // portal's own position in the document, escaping the sheet entirely.
    if (event.shiftKey && (document.activeElement === panel || document.activeElement === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={className} role="presentation" onClick={onDismiss}>
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
})`
  ${styles.ResponsiveSheet}
`;
