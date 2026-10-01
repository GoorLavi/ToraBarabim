import { useMutation } from '@tanstack/react-query';
import type { CreateVisitorMessageRequest } from '@torabarabim/common';
import { useRef } from 'react';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';

import { sendVisitorMessage } from './api';
import type { VisitorMessageSendStatus } from './models';

interface SendVisitorMessage {
  status: VisitorMessageSendStatus;
  send: (body: CreateVisitorMessageRequest) => void;
  reset: () => void;
}

const SEND_STATUS_BY_MUTATION_STATUS = {
  idle: 'idle',
  pending: 'sending',
  success: 'sent',
  error: 'failed',
} as const satisfies Record<'idle' | 'pending' | 'success' | 'error', VisitorMessageSendStatus>;

export const useSendVisitorMessage = (): SendVisitorMessage => {
  // A second press can land before React has re-rendered with the pending
  // state, so the render-time status alone cannot make a double press send
  // once.
  const isInFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: sendVisitorMessage,
    onSuccess: (_result, body) => {
      trackEvent(MIXPANEL_EVENTS.visitorMessageSent, { type: body.type });
    },
    onSettled: () => {
      isInFlight.current = false;
    },
  });

  const send = (body: CreateVisitorMessageRequest): void => {
    if (isInFlight.current) return;
    isInFlight.current = true;
    mutation.mutate(body);
  };

  return { status: SEND_STATUS_BY_MUTATION_STATUS[mutation.status], send, reset: mutation.reset };
};
