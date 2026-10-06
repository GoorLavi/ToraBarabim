import type { BeforeInstallPromptEvent, InstallPromptOutcome } from './models';

// The browser fires `beforeinstallprompt` once, early, and never repeats it
// for a listener that arrives late. entry.client.tsx therefore starts this
// store before hydration; a component subscribing later only reads what the
// store already caught.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isListening = false;
const listeners = new Set<() => void>();

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent): void => {
  // Without this the browser shows its own mini infobar and the page loses the
  // chance to choose the moment.
  event.preventDefault();
  deferredPrompt = event;
  notifyListeners();
};

const handleAppInstalled = (): void => {
  deferredPrompt = null;
  notifyListeners();
};

// Idempotent. Also called by `subscribe`, so a Storybook story that never
// goes through entry.client.tsx still hears a dispatched event.
export const startInstallPromptStore = (): void => {
  if (isListening || typeof window === 'undefined') return;
  isListening = true;
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
};

export const subscribe = (listener: () => void): (() => void) => {
  startInstallPromptStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// True while a deferred native prompt is waiting to be used.
export const getSnapshot = (): boolean => deferredPrompt !== null;

// The server never receives the event, and the first client render has to
// agree with it.
export const getServerSnapshot = (): boolean => false;

// A prompt event can be used once, so it is taken out of the store before
// `prompt()` runs: a second call answers 'unavailable' instead of throwing.
export const promptInstall = async (): Promise<InstallPromptOutcome> => {
  const event = deferredPrompt;
  if (event === null) return 'unavailable';

  deferredPrompt = null;
  notifyListeners();

  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch (error) {
    console.error('The native install prompt failed to open or to report a choice', error);
    return 'unavailable';
  }
};
