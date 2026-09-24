import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { ContactActions } from '~/components/ContactActions/ContactActions';
import * as pageConsts from '~/CoursePage/consts';
import { phoneDisplay, phoneToInternational } from '~/helpers';

import type { ContactBarProps } from './models';
import * as styles from './styles';

// The fixed bottom bar (styles.ts) that carries both registration actions
// while a course is open, built on the shared `ContactActions` (extracted
// from `DedicationWindow` in pass 1a): its own labels are the two channel
// names side by side, not the dedication window's phone-number-as-label.
export const ContactBar = styled(({ className, courseId, courseName, contactPhone }: ContactBarProps) => {
  const trackContact = (channel: 'whatsapp' | 'call'): void => {
    trackEvent(MIXPANEL_EVENTS.courseContactClick, { channel, courseId, courseName });
  };

  return (
    <div className={className}>
      <ContactActions
        {...{
          className: 'actions',
          whatsAppMessage: pageConsts.whatsAppMessage(courseName),
          whatsAppLabel: pageConsts.CONTACT_BAR_WHATSAPP_LABEL,
          callLabel: pageConsts.CONTACT_BAR_CALL_LABEL,
          phoneDisplay: phoneDisplay(contactPhone),
          phoneInternational: phoneToInternational(contactPhone),
          onWhatsAppClick: () => trackContact('whatsapp'),
          onCallClick: () => trackContact('call'),
        }}
      />
    </div>
  );
})`
  ${styles.ContactBar}
`;
