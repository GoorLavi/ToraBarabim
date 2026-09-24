import { useEffect } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import type { DedicationContactChannel } from '~/analytics/models';
import { Ornament } from '~/components/DedicationUnit/Ornament';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';
import { WHATSAPP_ICON_PATH } from '~/consts';
import { whatsAppHref } from '~/helpers';

import * as consts from './consts';
import type { DedicationWindowProps } from './models';
import * as styles from './styles';

// The one shared window every band's invitation line and press-anywhere
// gesture open. Built directly on `ResponsiveSheet`, the same shape
// `MoveExceptionSheet` and `MoveOccurrenceSheet` already use for a sheet
// that is not `PanelFrame`'s grouped, dialog-shaped layout.
export const DedicationWindow = styled(({ className, bandType, onDismiss }: DedicationWindowProps) => {
  useEffect(() => {
    trackEvent(MIXPANEL_EVENTS.dedicationWindowOpen, { bandType });
  }, [bandType]);

  const trackContact = (channel: DedicationContactChannel): void => {
    trackEvent(MIXPANEL_EVENTS.dedicationContactClick, { channel, bandType });
  };

  return (
    <ResponsiveSheet {...{ className, ariaLabel: consts.WINDOW_TITLE, onDismiss }}>
      <button type="button" className="close" aria-label={consts.CLOSE_LABEL} onClick={onDismiss}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="header">
        <div className="ornament">
          <Ornament />
        </div>
        <h2 className="title">{consts.WINDOW_TITLE}</h2>
        <div className="formulas">
          <span className="formula">{consts.FORMULA_MEMORIAL}</span>
          <span className="formula">{consts.FORMULA_HEALING}</span>
          <span className="formula">{consts.FORMULA_SUCCESS}</span>
        </div>
        <div className="ornament">
          <Ornament mirrored />
        </div>
      </div>

      <div className="body">
        <p className="paragraph">{consts.PARAGRAPH}</p>
        <p className="leadIn">{consts.LEAD_IN}</p>

        <div className="actions">
          <QuietButton
            {...{
              className: 'whatsapp',
              icon: (
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={WHATSAPP_ICON_PATH} />
                </svg>
              ),
              label: consts.WHATSAPP_LABEL,
              href: whatsAppHref(consts.WHATSAPP_MESSAGE),
              target: '_blank',
              rel: 'noopener noreferrer',
              onClick: () => trackContact('whatsapp'),
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
              label: consts.CALL_LABEL,
              href: consts.CALL_HREF,
              ariaLabel: consts.CALL_ACCESSIBLE_NAME,
              onClick: () => trackContact('call'),
            }}
          />
        </div>
      </div>
    </ResponsiveSheet>
  );
})`
  ${styles.DedicationWindow}
`;
