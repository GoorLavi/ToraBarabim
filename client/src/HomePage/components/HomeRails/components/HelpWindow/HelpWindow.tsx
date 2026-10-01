import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { VISITOR_MESSAGE_TITLES } from '~/HomePage/components/consts';

import { VisitorMessageForm } from './components/VisitorMessageForm/VisitorMessageForm';
import * as consts from './consts';
import type { HelpWindowProps } from './models';
import * as styles from './styles';

// Built on `ResponsiveSheet` like `DedicationWindow`. It holds no state of
// its own: the draft and the send status come from `HomeRails`, which stays
// mounted when this closes.
export const HelpWindow = styled(({ className, kind, draft, status, onDraftChange, onSubmit, onDismiss }: HelpWindowProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const thankYouRef = useRef<HTMLHeadingElement>(null);
  const title = VISITOR_MESSAGE_TITLES[kind];
  const copy = consts.HELP_WINDOW_COPY[kind];

  // Focus goes to the title on open, never to a field: a field would raise
  // the phone keyboard before the visitor has read anything.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === 'sent') thankYouRef.current?.focus();
  }, [status]);

  return (
    <ResponsiveSheet {...{ className, ariaLabel: title, onDismiss }}>
      <button type="button" className="close" aria-label={consts.CLOSE_LABEL} onClick={onDismiss}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="header">
        <h2 className="title" tabIndex={-1} ref={titleRef}>
          {title}
        </h2>
      </div>

      {status === 'sent' ? (
        <div className="thankYou">
          <span className="checkCircle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h3 className="message" tabIndex={-1} ref={thankYouRef}>
            {consts.THANK_YOU_MESSAGE}
          </h3>
          <button type="button" className="done" onClick={onDismiss}>
            {consts.CLOSE_LABEL}
          </button>
        </div>
      ) : (
        <div className="body">
          <div className="explanation">
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <VisitorMessageForm {...{ draft, status, messagePlaceholder: copy.messagePlaceholder, onDraftChange, onSubmit }} />
        </div>
      )}
    </ResponsiveSheet>
  );
})`
  ${styles.HelpWindow}
`;
