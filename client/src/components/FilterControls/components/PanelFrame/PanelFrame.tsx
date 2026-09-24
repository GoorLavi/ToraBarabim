import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import { focusableElementsIn } from '~/components/helpers';

import type { PanelFrameProps } from './models';
import * as styles from './styles';

// The frame both header pickers' dialogs share (CityPicker, AudienceFilter):
// the handle, heading row and close button, plus the behaviour a modal
// dialog needs, which a bare copy of the markup previously dropped: focus
// moves into the dialog on open, Escape closes it, Tab is trapped inside
// it. Returning focus to whichever control opened it is the caller's own
// job (it owns that ref), done through `onClose`.
export const PanelFrame = styled(
  ({ className, isDrawer, isWide, heading, closeLabel, onClose, initialFocusRef, fixedContent, children }: PanelFrameProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Below `sm` the panel is a bottom-anchored drawer, and iOS's software
    // keyboard would push it under itself if focus landed on a text field,
    // so focus goes to the panel instead; from `sm` up there is no software
    // keyboard to fight, so a provided `initialFocusRef` wins.
    useEffect(() => {
      if (isWide && initialFocusRef?.current) initialFocusRef.current.focus();
      else panelRef.current?.focus();
    }, [isWide, initialFocusRef]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = focusableElementsIn(panelRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    return (
      <div className={className} ref={panelRef} tabIndex={-1} onKeyDown={handleKeyDown}>
        {isDrawer && <div className="handle" aria-hidden="true" />}

        <div className="headingRow">
          <h2 className="heading">{heading}</h2>
          <button type="button" className="close" aria-label={closeLabel} onClick={onClose}>
            <svg className="closeIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {fixedContent}

        <div className="hairline" />

        {children}
      </div>
    );
  },
)`
  ${styles.PanelFrame}
`;
