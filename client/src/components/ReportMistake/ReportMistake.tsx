import { useRef, useState } from 'react';
import styled from 'styled-components';

import { EMPTY_VISITOR_MESSAGE_DRAFT } from '~/components/HelpWindow/consts';
import { HelpWindow } from '~/components/HelpWindow/HelpWindow';
import type { VisitorMessageDraft } from '~/components/HelpWindow/models';
import { useSendVisitorMessage } from '~/components/HelpWindow/useSendVisitorMessage';

import { ReportContext } from './components/ReportContext/ReportContext';
import * as consts from './consts';
import type { ReportMistakeProps } from './models';
import * as styles from './styles';

// The quiet one-line entry to the visitor message form, for a page that
// shows a listing someone may know is wrong. Owns its window, its one draft
// and its one send, so the page only says what the report is about.
export const ReportMistake = styled(({ className, subject, contextLines }: ReportMistakeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<VisitorMessageDraft>(EMPTY_VISITOR_MESSAGE_DRAFT);
  const { status, send, reset } = useSendVisitorMessage();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const submit = (): void => {
    send({ type: 'report-mistake', subject, name: draft.name.trim(), phone: draft.phone, message: draft.message.trim() });
  };

  const close = (): void => {
    // A sent report ends its draft, so reopening starts clean. A failed one
    // keeps what was typed but not the failure line, which would greet the
    // next opening about a press it does not remember. A send still in
    // flight is left to finish.
    if (status === 'sent') {
      reset();
      setDraft(EMPTY_VISITOR_MESSAGE_DRAFT);
    } else if (status === 'failed') {
      reset();
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={className}>
      <button type="button" className="trigger" ref={triggerRef} onClick={() => setIsOpen(true)}>
        <span className="lead">{consts.REPORT_PROMPT_LEAD}</span> <span className="action">{consts.REPORT_PROMPT_ACTION}</span>
      </button>

      {isOpen && (
        <HelpWindow
          {...{
            title: consts.REPORT_WINDOW_TITLE,
            paragraphs: consts.REPORT_WINDOW_PARAGRAPHS,
            messagePlaceholder: consts.REPORT_MESSAGE_PLACEHOLDERS[subject.kind],
            context: <ReportContext label={consts.REPORT_CONTEXT_LABELS[subject.kind]} lines={contextLines} />,
            draft,
            status,
            onDraftChange: setDraft,
            onSubmit: submit,
            onDismiss: close,
          }}
        />
      )}
    </div>
  );
})`
  ${styles.ReportMistake}
`;
