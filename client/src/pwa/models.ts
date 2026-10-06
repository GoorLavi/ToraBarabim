// Not in lib.dom.d.ts: Chromium-only, so TypeScript's DOM types omit it.
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  // Safari on iOS only: true when the page was launched from the home screen.
  interface Navigator {
    standalone?: boolean;
  }
}

export type InstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable';

// 'killSwitch' ships sw-kill-switch.js as /sw.js and stops registering a worker.
export type ServiceWorkerMode = 'active' | 'killSwitch';

export interface SplashScreen {
  // CSS pixels, portrait. The image itself is width * pixelRatio by height * pixelRatio.
  width: number;
  height: number;
  pixelRatio: number;
}

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: 'image/png';
  purpose: 'any' | 'maskable';
}
