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
