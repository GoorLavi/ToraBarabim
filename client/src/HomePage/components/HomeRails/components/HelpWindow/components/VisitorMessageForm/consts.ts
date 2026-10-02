import type { VisitorMessageField } from './models';

// Hand-mirrored from the server's own limits, so the field stops a visitor
// at the same length the route would reject: NAME_MAX_LENGTH and
// MESSAGE_MAX_LENGTH in server/src/service/visitor-message/consts.ts.
export const NAME_MAX_LENGTH = 80;
export const MESSAGE_MAX_LENGTH = 1000;

// The order a visitor meets the fields in, which is also the order focus
// lands on the first invalid one.
export const FIELD_ORDER: readonly VisitorMessageField[] = ['name', 'phone', 'message'];

export const FIELD_LABELS: Record<VisitorMessageField, string> = {
  name: 'שם',
  phone: 'מספר פלאפון',
  message: 'הודעה',
};

export const FIELD_ERRORS: Record<VisitorMessageField, string> = {
  name: 'יש למלא שם',
  phone: 'יש למלא מספר פלאפון תקין',
  message: 'יש לכתוב הודעה',
};

export const SUBMIT_LABEL = 'שליחה';
export const SUBMIT_SENDING_LABEL = 'שולחים...';
export const SEND_FAILURE_MESSAGE = 'לא הצלחנו לשלוח את ההודעה. אפשר לנסות שוב.';

export const MESSAGE_FIELD_ROWS = 4;
