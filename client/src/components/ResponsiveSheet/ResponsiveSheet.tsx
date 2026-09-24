import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import { focusableElementsIn } from '~/components/helpers';

import type { ResponsiveSheetProps } from './models';
import * as styles from './styles';

// Portalled into `document.body`: a transformed ancestor (`PinnedHeaderBar`)
// would otherwise become the containing block for this `position: fixed`
// element and clip it to the bar's own box instead of the viewport.
export const ResponsiveSheet = styled(({ className, ariaLabel, onDismiss, children }: ResponsiveSheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves onto the panel itself, not its first focusable descendant,
  // so a sheet whose first control is destructive (`DiscardChangesSheet`)
  // is never one blind Enter away from being activated; skipped when focus
  // already sits inside (a picker's own autofocused search input keeps its
  // focus, since a descendant's mount effect always runs before this one).
  // On unmount, focus is returned to whatever held it before, but only if
  // that element is still in the document and focus has not already moved
  // somewhere else on purpose (outside the panel and off `<body>`).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // Only when focus is still outside: a descendant's own mount effect
    // (which runs first) may have already claimed it, and that focus is not
    // this effect's to remember or restore.
    const focusWasOutside = !panel.contains(document.activeElement);
    const previouslyFocused = focusWasOutside ? document.activeElement : null;
    if (focusWasOutside) panel.focus();

    return () => {
      if (!(previouslyFocused instanceof HTMLElement) || !document.contains(previouslyFocused)) return;
      if (!panel.contains(document.activeElement) && document.activeElement !== document.body) return;
      previouslyFocused.focus();
    };
  }, []);

  // Reacts to `keydown` Tab only, never a focus or pointer event: that is
  // the Safari trap this codebase already shipped and fixed once (a36eaba).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      // Never `stopPropagation`, only `defaultPrevented`: a popover nested
      // inside this sheet owns Escape in its own capture-phase listener and
      // calls `preventDefault()` when it closes itself, so this only acts
      // once nothing inside has already claimed the key.
      if (event.defaultPrevented) return;
      // Escape closes the sheet even while a caller has disabled its own
      // back button for a pending request (five panel sheets do this), the
      // same as a scrim tap already does, so an in-flight error can be lost
      // this way; accepted for now (owner decision), not fixed by an
      // `isDismissible` prop.
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

    // Focus opens on the panel itself (above), not on `first`, so
    // shift+Tab from there has to wrap the same way shift+Tab from `first`
    // does, or it escapes the sheet through whatever precedes this portal
    // in the document instead.
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
