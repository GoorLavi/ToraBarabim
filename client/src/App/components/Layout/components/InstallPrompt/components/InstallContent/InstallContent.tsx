import { InAppExplanation } from './components/InAppExplanation/InAppExplanation';
import { InstallSteps } from './components/InstallSteps/InstallSteps';
import { OfferCard } from './components/OfferCard/OfferCard';
import * as consts from './consts';
import type { InstallContentProps } from './models';

// One content component for the automatic card and the footer flow: what
// differs between them is the shell around it and the step it starts on,
// both decided by the caller.
export const InstallContent = ({ step, device, onAccept, onDismiss, onCopyLink }: InstallContentProps) => {
  if (step === 'offer') {
    return <OfferCard {...{ isComputer: device.isComputer, onAccept, onDismiss }} />;
  }

  switch (device.path) {
    case 'iosSafari':
    case 'iosOtherBrowser':
      return <InstallSteps {...{ content: consts.iosInstructions(device.shareButtonPlacement), onClose: onDismiss }} />;
    case 'inAppBrowser':
      return <InAppExplanation {...{ onCopyLink, onClose: onDismiss }} />;
    // A Chromium path never reaches this step (its footer link opens the
    // native dialog); the menu steps are the honest fallback if it ever does.
    case 'chromiumPrompt':
    case 'androidGeneric':
      return <InstallSteps {...{ content: consts.BROWSER_MENU_INSTRUCTIONS, onClose: onDismiss }} />;
  }
};
