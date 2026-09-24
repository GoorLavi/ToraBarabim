import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { ContactActions } from '~/components/ContactActions/ContactActions';
import * as pageConsts from '~/CoursePage/consts';
import { phoneDisplay, phoneToInternational } from '~/helpers';

import type { ContactBarProps } from './models';
import * as styles from './styles';

// Rendered twice, real and mirrored, CSS toggling which one is visible
// (styles.ts), the same technique `ClosedPanel` uses: a fixed bottom bar
// with the short channel-name pair below `lg` (design-system.md, "the
// fixed bar"; spec section 13), and the fuller, dedication-window-style
// treatment inline in the side card from `lg` up (design brief A, item
// 12). Both fire the same `Course Contact Click`.
export const ContactBar = styled(({ className, courseId, courseName, contactPhone }: ContactBarProps) => {
  const trackContact = (channel: 'whatsapp' | 'call'): void => {
    trackEvent(MIXPANEL_EVENTS.courseContactClick, { channel, courseId, courseName });
  };

  const shared = {
    whatsAppMessage: pageConsts.whatsAppMessage(courseName),
    phoneDisplay: phoneDisplay(contactPhone),
    phoneInternational: phoneToInternational(contactPhone),
    onWhatsAppClick: () => trackContact('whatsapp'),
    onCallClick: () => trackContact('call'),
  };

  return (
    <div className={className}>
      <ContactActions
        {...{
          className: 'phoneActions',
          ...shared,
          whatsAppLabel: pageConsts.CONTACT_BAR_WHATSAPP_LABEL,
          callLabel: pageConsts.CONTACT_BAR_CALL_LABEL,
        }}
      />

      <p className="desktopLabel">{pageConsts.REGISTRATION_LABEL}</p>
      <ContactActions
        {...{
          className: 'desktopActions',
          ...shared,
          whatsAppLabel: pageConsts.WHATSAPP_FULL_LABEL,
          callLabel: phoneDisplay(contactPhone),
        }}
      />
    </div>
  );
})`
  ${styles.ContactBar}
`;
