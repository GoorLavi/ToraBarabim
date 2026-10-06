import styled from 'styled-components';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import { InstallContent } from './components/InstallContent/InstallContent';
import * as consts from './consts';
import type { InstallPromptProps } from './models';
import * as styles from './styles';

// The automatic card is the non-modal shell, so the page stays usable
// behind it; a flow the visitor opened from the footer is the ordinary
// modal sheet, since they asked for it and nothing else needs their hands.
export const InstallPrompt = styled(({ className, flow, onAccept, onDismiss, onCopyLink }: InstallPromptProps) => {
  if (flow.status === 'closed') return null;

  const { trigger, step, device } = flow;
  const ariaLabel = device.isComputer ? consts.COMPUTER_SHEET_ARIA_LABEL : consts.SHEET_ARIA_LABEL;

  return (
    <ResponsiveSheet {...{ className, ariaLabel, onDismiss, isNonModal: trigger === 'auto' }}>
      <InstallContent {...{ step, device, onAccept, onDismiss, onCopyLink }} />
    </ResponsiveSheet>
  );
})`
  ${styles.InstallPrompt}
`;
