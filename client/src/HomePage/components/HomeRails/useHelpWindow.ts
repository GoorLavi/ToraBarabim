import type { VisitorMessageType } from '@torabarabim/common';
import { useState } from 'react';

import { EMPTY_VISITOR_MESSAGE_DRAFT, EMPTY_VISITOR_MESSAGE_DRAFTS } from './components/HelpWindow/consts';
import type { HelpWindowState, OpenHelpWindow, VisitorMessageDraft } from './models';
import { useSendVisitorMessage } from './useSendVisitorMessage';

// Lives in `HomeRails`, above every tile and the window, so a refetch that
// moves a tile to another row (the server places tiles anew on every
// request) never closes the window or loses what was typed.
export const useHelpWindow = (): HelpWindowState => {
  const [openWindow, setOpenWindow] = useState<OpenHelpWindow | undefined>(undefined);
  const [drafts, setDrafts] = useState(EMPTY_VISITOR_MESSAGE_DRAFTS);

  const sends = { 'rabbi-request': useSendVisitorMessage(), volunteer: useSendVisitorMessage() };
  const sendStatuses = { 'rabbi-request': sends['rabbi-request'].status, volunteer: sends.volunteer.status };

  const changeDraft = (kind: VisitorMessageType, draft: VisitorMessageDraft): void => {
    setDrafts((current) => ({ ...current, [kind]: draft }));
  };

  const send = (kind: VisitorMessageType): void => {
    const { name, phone, message } = drafts[kind];
    sends[kind].send({ type: kind, name: name.trim(), phone, message: message.trim() });
  };

  const close = (): void => {
    if (!openWindow) return;
    const { kind, opener } = openWindow;

    // A sent message's thank-you is the end of that draft: reopening starts
    // clean. Any other close keeps the draft for the next press.
    if (sends[kind].status === 'sent') {
      sends[kind].reset();
      changeDraft(kind, EMPTY_VISITOR_MESSAGE_DRAFT);
    }

    // The tile may have moved to another row while the window was open, in
    // which case the old element is gone and focus is left where the sheet
    // puts it.
    if (opener.isConnected) opener.focus();
    setOpenWindow(undefined);
  };

  return {
    openKind: openWindow?.kind,
    drafts,
    sendStatuses,
    open: (kind, opener) => setOpenWindow({ kind, opener }),
    close,
    changeDraft,
    send,
  };
};
