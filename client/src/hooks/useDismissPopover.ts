import { useEffect, useRef } from 'react';

import type { DismissPopoverOptions } from './models';

// A popover that autofocuses its own search input has to close on an
// outside pointer, on keyboard tab-away, and on Escape, but a plain `onBlur`
// on the popover's root cannot tell those apart from the case that broke
// CitySelect. In Safari, a mousedown on a <button> does not move focus, so
// clicking a result fires `focusout` with `relatedTarget` null before the
// click's own handler runs; treating that as an outside dismissal unmounts
// the option out from under the click. The `pointerdown` listener already
// owns the real outside click on every browser, including that one, so the
// null-`relatedTarget` case is left for it and ignored here.
export const useDismissPopover = ({ isOpen, rootRef, onDismiss, triggerRef }: DismissPopoverOptions): void => {
  const latest = useRef({ onDismiss, triggerRef });

  // Runs before the listener effect below on every commit, so the
  // listeners (which only ever fire after paint) always read the latest
  // callbacks without this being a write during render.
  useEffect(() => {
    latest.current = { onDismiss, triggerRef };
  });

  useEffect(() => {
    if (!isOpen) return;

    const isInsideRoot = (node: Node | null): boolean => Boolean(node && rootRef.current?.contains(node));

    const handlePointerDown = (event: PointerEvent): void => {
      if (isInsideRoot(event.target as Node)) return;
      latest.current.onDismiss();
    };

    const handleFocusOut = (event: FocusEvent): void => {
      if (!isInsideRoot(event.target as Node)) return;
      if (event.relatedTarget === null) return;
      if (isInsideRoot(event.relatedTarget as Node)) return;
      latest.current.onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      latest.current.onDismiss();
      latest.current.triggerRef?.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, rootRef]);
};
