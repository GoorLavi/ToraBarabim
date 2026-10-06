import type { InstallPlatformPath, InstallTrigger } from '~/analytics/consts';

export interface InstallEnvironment {
  userAgent: string;
  maxTouchPoints: number;
  hasDeferredPrompt: boolean;
  isStandalone: boolean;
}

// What the visitor has already been through. `wasShownThisSession` is the
// per-tab half, the other two outlive the session.
export interface InstallPromptState {
  dismissalCount: number;
  isInstalled: boolean;
  wasShownThisSession: boolean;
}

// Where the share button sits on the visitor's own screen: at the bottom of
// iPhone Safari, at the top everywhere else on iOS (iPad, and every iOS
// browser other than Safari).
export type ShareButtonPlacement = 'bottom' | 'top';

// Everything about the visitor's device that the card's words depend on,
// fixed when the card opens so its text cannot change under the reader.
export interface InstallDevice {
  path: InstallPlatformPath;
  isComputer: boolean;
  shareButtonPlacement: ShareButtonPlacement;
}

// `instructions` is the step after the offer for an iOS visitor who accepted
// it; a flow opened from the footer starts there directly.
export type InstallFlow =
  | { status: 'closed' }
  | { status: 'open'; trigger: InstallTrigger; step: 'offer' | 'instructions'; device: InstallDevice };

export interface InstallPromptProps {
  className?: string;
  flow: InstallFlow;
  onAccept: () => void;
  onDismiss: () => void;
  onCopyLink: () => Promise<void>;
}

export interface InstallFooterLink {
  label: string;
  onOpen: () => void;
}

export interface BrowserEnvironment {
  userAgent: string;
  maxTouchPoints: number;
  isStandalone: boolean;
}

export interface UseInstallStateOptions {
  // A seam for the stories, which cannot wait a minute: the app never passes it.
  autoShowAfterSeconds?: number;
}

export interface InstallState {
  prompt: Omit<InstallPromptProps, 'className'>;
  // `null` until the browser has been read after mount, and for good when
  // there is nothing to offer or the site is already installed.
  footerLink: InstallFooterLink | null;
}
