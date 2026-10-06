import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INSTALL_PROMPT_SESSION_KEY, INSTALL_PROMPT_STORAGE_KEY } from './consts';
import { afterDismissal, afterShow, canShowAutomatically } from './helpers';
import { readInstallPromptState, writeInstallPromptState } from './storage';

type FakeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const memoryStorage = (entries: Record<string, string> = {}): FakeStorage => ({
  getItem: (key) => entries[key] ?? null,
  setItem: (key, value) => {
    entries[key] = value;
  },
});

const throwingStorage = (failing: 'getItem' | 'setItem'): FakeStorage => ({
  ...memoryStorage(),
  [failing]: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
});

const stubStorages = (localStorage: FakeStorage, sessionStorage: FakeStorage = memoryStorage()): void => {
  vi.stubGlobal('window', { localStorage, sessionStorage });
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('install prompt storage', () => {
  it('reads a fresh visitor when nothing is stored', () => {
    stubStorages(memoryStorage());

    expect(readInstallPromptState()).toEqual({ dismissalCount: 0, isInstalled: false, wasShownThisSession: false });
  });

  it('round-trips a dismissal, and the session flag stays per session', () => {
    const local: Record<string, string> = {};
    stubStorages(memoryStorage(local), memoryStorage());
    const fresh = readInstallPromptState();
    if (!fresh) throw new Error('expected a readable state');

    expect(writeInstallPromptState(afterShow(fresh))).toBe(true);
    expect(readInstallPromptState()?.wasShownThisSession).toBe(true);
    expect(writeInstallPromptState(afterDismissal(afterShow(fresh)))).toBe(true);

    stubStorages(memoryStorage(local), memoryStorage());
    expect(readInstallPromptState()).toEqual({ dismissalCount: 1, isInstalled: false, wasShownThisSession: false });
  });

  it('lets an ignored card come back in a later session', () => {
    const local: Record<string, string> = {};
    stubStorages(memoryStorage(local), memoryStorage());
    const fresh = readInstallPromptState();
    if (!fresh) throw new Error('expected a readable state');
    writeInstallPromptState(afterShow(fresh));

    stubStorages(memoryStorage(local), memoryStorage());

    expect(canShowAutomatically('chromiumPrompt', readInstallPromptState())).toBe(true);
  });

  it('never shows when the read throws', () => {
    stubStorages(throwingStorage('getItem'));

    expect(readInstallPromptState()).toBeNull();
    expect(canShowAutomatically('chromiumPrompt', readInstallPromptState())).toBe(false);
  });

  it('reports a failed write so the card is not opened', () => {
    stubStorages(throwingStorage('setItem'));

    expect(writeInstallPromptState({ dismissalCount: 0, isInstalled: false, wasShownThisSession: true })).toBe(false);
  });

  it('reports a failed session write as a failed write', () => {
    stubStorages(memoryStorage(), throwingStorage('setItem'));

    expect(writeInstallPromptState({ dismissalCount: 0, isInstalled: false, wasShownThisSession: true })).toBe(false);
  });

  it('fails closed on a stored value that is not ours', () => {
    stubStorages(memoryStorage({ [INSTALL_PROMPT_STORAGE_KEY]: '{"dismissalCount":"two"}' }));
    expect(readInstallPromptState()).toBeNull();

    stubStorages(memoryStorage({ [INSTALL_PROMPT_STORAGE_KEY]: 'not json' }));
    expect(readInstallPromptState()).toBeNull();
  });

  it('fails closed when there is no window at all', () => {
    expect(readInstallPromptState()).toBeNull();
    expect(writeInstallPromptState({ dismissalCount: 0, isInstalled: false, wasShownThisSession: false })).toBe(false);
  });

  it('reads the session flag from its own key', () => {
    stubStorages(memoryStorage(), memoryStorage({ [INSTALL_PROMPT_SESSION_KEY]: 'true' }));

    expect(readInstallPromptState()?.wasShownThisSession).toBe(true);
  });
});
