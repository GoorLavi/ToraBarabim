import { INSTALL_PROMPT_SESSION_KEY, INSTALL_PROMPT_STORAGE_KEY } from './consts';
import type { InstallPromptState } from './models';

type StoredHistory = Pick<InstallPromptState, 'dismissalCount' | 'isInstalled'>;

const isStoredHistory = (value: unknown): value is StoredHistory => {
  if (typeof value !== 'object' || value === null) return false;
  const { dismissalCount, isInstalled } = value as Record<string, unknown>;
  return typeof dismissalCount === 'number' && Number.isInteger(dismissalCount) && dismissalCount >= 0 && typeof isInstalled === 'boolean';
};

// Fails closed, and on purpose the opposite of the analytics storage reads:
// this limit is a promise to the visitor that we will not keep asking, and a
// browser that blocks storage cannot keep it. So a read that throws, a value
// that is not ours, or a write that throws all mean "do not show", never
// "assume a fresh visitor". The cost is that a visitor with storage blocked
// never sees the card; the footer link, which asks nothing of storage, is
// still there.
export const readInstallPromptState = (): InstallPromptState | null => {
  try {
    const rawHistory = window.localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY);
    const wasShownThisSession = window.sessionStorage.getItem(INSTALL_PROMPT_SESSION_KEY) === 'true';

    if (rawHistory === null) return { dismissalCount: 0, isInstalled: false, wasShownThisSession };

    const history: unknown = JSON.parse(rawHistory);
    if (!isStoredHistory(history)) return null;
    return { dismissalCount: history.dismissalCount, isInstalled: history.isInstalled, wasShownThisSession };
  } catch (error) {
    console.warn(`Could not read the install prompt history from storage (${INSTALL_PROMPT_STORAGE_KEY}), so the automatic card will not open`, error);
    return null;
  }
};

// Returns whether both writes landed. The card is opened only after writing
// that it was shown, so a browser that reads but cannot write is found out
// before the visitor sees anything, not after a second dismissal that could
// never be recorded.
export const writeInstallPromptState = (state: InstallPromptState): boolean => {
  try {
    const history: StoredHistory = { dismissalCount: state.dismissalCount, isInstalled: state.isInstalled };
    window.localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, JSON.stringify(history));
    window.sessionStorage.setItem(INSTALL_PROMPT_SESSION_KEY, String(state.wasShownThisSession));
    return true;
  } catch (error) {
    console.warn(`Could not write the install prompt history to storage (${INSTALL_PROMPT_STORAGE_KEY})`, error);
    return false;
  }
};
