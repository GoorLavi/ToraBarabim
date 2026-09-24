import { QuietButton } from '~/components/QuietButton/QuietButton';
import { WHATSAPP_ICON_PATH } from '~/consts';
import { whatsAppHref } from '~/helpers';

import * as consts from './consts';
import type { ContactActionsProps } from './models';

// The two registration actions every course and every dedication invitation
// share: a WhatsApp message and a click-to-call, both driven by one contact
// number. Owns the icons, the hrefs and the call button's accessible name;
// a caller supplies the number, the copy and its own layout CSS through
// `className` (design-system.md gives the dedication window a stacked
// column and the course page a side-by-side row, so no layout lives here).
export const ContactActions = ({ className, whatsAppMessage, whatsAppLabel, callLabel, phoneDisplay, phoneInternational, onWhatsAppClick, onCallClick }: ContactActionsProps) => (
  <div className={className}>
    <QuietButton
      {...{
        className: 'whatsapp',
        icon: (
          <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={WHATSAPP_ICON_PATH} />
          </svg>
        ),
        label: whatsAppLabel,
        href: whatsAppHref(whatsAppMessage, phoneInternational),
        target: '_blank',
        rel: 'noopener noreferrer',
        onClick: onWhatsAppClick,
      }}
    />
    <QuietButton
      {...{
        className: 'call',
        icon: (
          <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={consts.CALL_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        label: callLabel,
        href: `tel:+${phoneInternational}`,
        ariaLabel: `${consts.CALL_ACCESSIBLE_NAME_PREFIX} ${phoneDisplay}`,
        onClick: onCallClick,
      }}
    />
  </div>
);
