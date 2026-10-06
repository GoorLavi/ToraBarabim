import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { getServerSnapshot, getSnapshot, promptInstall, subscribe } from '~/pwa/installPromptStore';
import { isStandaloneDisplay } from '~/pwa/isStandaloneDisplay';

import { AUTO_SHOW_AFTER_VISIBLE_SECONDS, AUTO_SHOW_TICK_MS, COMPUTER_FOOTER_LINK_LABEL, PHONE_FOOTER_LINK_LABEL } from './consts';
import {
  afterDismissal,
  afterInstall,
  afterShow,
  canShowAutomatically,
  installPathFor,
  isComputerDevice,
  isUserBusy,
  shareButtonPlacementFor,
} from './helpers';
import type { BrowserEnvironment, InstallDevice, InstallFlow, InstallPromptState, InstallState, UseInstallStateOptions } from './models';
import { readInstallPromptState, writeInstallPromptState } from './storage';

const CLOSED: InstallFlow = { status: 'closed' };

// Owns the whole install flow for the public pages: whether there is
// anything to offer, when the automatic card opens, what the footer link
// does, and every event. Browser reads happen after mount, never in render:
// the server renders no card and no link, and the first client render must
// match it.
export const useInstallState = ({ autoShowAfterSeconds = AUTO_SHOW_AFTER_VISIBLE_SECONDS }: UseInstallStateOptions = {}): InstallState => {
  const hasDeferredPrompt = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [environment, setEnvironment] = useState<BrowserEnvironment | null>(null);
  const [isMarkedInstalled, setIsMarkedInstalled] = useState(false);
  const [flow, setFlow] = useState<InstallFlow>(CLOSED);
  const storedStateRef = useRef<InstallPromptState | null>(null);
  const visibleSecondsRef = useRef(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const stored = readInstallPromptState();
    storedStateRef.current = stored;
    setIsMarkedInstalled(stored?.isInstalled ?? false);
    setEnvironment({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      isStandalone: isStandaloneDisplay(),
    });
  }, []);

  const device = useMemo((): InstallDevice | null => {
    if (environment === null) return null;
    const path = installPathFor({ ...environment, hasDeferredPrompt });
    if (path === null) return null;
    return { path, isComputer: isComputerDevice(environment), shareButtonPlacement: shareButtonPlacementFor(environment) };
  }, [environment, hasDeferredPrompt]);

  const recordChange = (change: (state: InstallPromptState) => InstallPromptState): void => {
    const current = storedStateRef.current;
    if (current === null) return;
    const next = change(current);
    storedStateRef.current = next;
    if (!writeInstallPromptState(next)) {
      console.warn('Could not store the install prompt history; the automatic card may return in a later session');
    }
  };

  // An ignored card leaves with the page it opened on: not counted, and not
  // brought back this session (its show was already written).
  useEffect(() => {
    setFlow((current) => (current.status === 'open' && current.trigger === 'auto' ? CLOSED : current));
  }, [pathname]);

  useEffect(() => {
    const handleAppInstalled = (): void => {
      recordChange(afterInstall);
      setIsMarkedInstalled(true);
      setFlow(CLOSED);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  useEffect(() => {
    if (device === null || !canShowAutomatically(device.path, storedStateRef.current)) return;

    const showAutomatically = (): void => {
      const current = storedStateRef.current;
      if (current === null) return;

      // The show is written before the card opens, so a browser that cannot
      // write is found out here and the card never appears (fail closed,
      // storage.ts).
      const shown = afterShow(current);
      if (!writeInstallPromptState(shown)) return;
      storedStateRef.current = shown;

      trackEvent(MIXPANEL_EVENTS.installCardShown, { platformPath: device.path, trigger: 'auto' });
      setFlow({ status: 'open', trigger: 'auto', step: 'offer', device });
    };

    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      visibleSecondsRef.current += 1;
      if (visibleSecondsRef.current < autoShowAfterSeconds) return;
      if (isUserBusy(document)) return;

      window.clearInterval(timer);
      showAutomatically();
    }, AUTO_SHOW_TICK_MS);

    return () => window.clearInterval(timer);
  }, [device, autoShowAfterSeconds]);

  // The card closes before the browser's own dialog opens: two stacked
  // prompts would hide the one that matters.
  const runNativePrompt = async (promptDevice: InstallDevice, trigger: 'auto' | 'footer'): Promise<void> => {
    setFlow(CLOSED);
    const outcome = await promptInstall();

    if (outcome === 'accepted') {
      trackEvent(MIXPANEL_EVENTS.installAccepted, { platformPath: promptDevice.path, trigger });
      recordChange(afterInstall);
      setIsMarkedInstalled(true);
      return;
    }

    if (outcome === 'dismissed') {
      trackEvent(MIXPANEL_EVENTS.installCardDismissed, { platformPath: promptDevice.path, trigger, step: 'nativePrompt' });
      if (trigger === 'auto') recordChange(afterDismissal);
    }
  };

  const accept = (): void => {
    if (flow.status !== 'open') return;

    if (flow.device.path === 'chromiumPrompt') {
      void runNativePrompt(flow.device, flow.trigger);
      return;
    }

    trackEvent(MIXPANEL_EVENTS.installAccepted, { platformPath: flow.device.path, trigger: flow.trigger });
    setFlow({ ...flow, step: 'instructions' });
  };

  // "Not now", Escape, a tap on a modal sheet's backdrop and "Got it" all
  // land here. An automatic card that already went on to the instructions was
  // accepted, so closing it reports no dismissal.
  const dismiss = (): void => {
    if (flow.status !== 'open') return;

    const wasAccepted = flow.trigger === 'auto' && flow.step === 'instructions';
    if (!wasAccepted) {
      trackEvent(MIXPANEL_EVENTS.installCardDismissed, { platformPath: flow.device.path, trigger: flow.trigger, step: 'card' });
    }
    if (flow.trigger === 'auto') recordChange(afterDismissal);
    setFlow(CLOSED);
  };

  const openFromFooter = (): void => {
    if (device === null) return;

    trackEvent(MIXPANEL_EVENTS.installCardShown, { platformPath: device.path, trigger: 'footer' });

    if (device.path === 'chromiumPrompt') {
      void runNativePrompt(device, 'footer');
      return;
    }
    setFlow({ status: 'open', trigger: 'footer', step: 'instructions', device });
  };

  const copyLink = async (): Promise<void> => {
    if (!navigator.clipboard) {
      throw new Error(`Expected navigator.clipboard to copy ${window.location.href}, this browser does not provide it`);
    }
    await navigator.clipboard.writeText(window.location.href);
  };

  const footerLink =
    device === null || isMarkedInstalled
      ? null
      : { label: device.isComputer ? COMPUTER_FOOTER_LINK_LABEL : PHONE_FOOTER_LINK_LABEL, onOpen: openFromFooter };

  return { prompt: { flow, onAccept: accept, onDismiss: dismiss, onCopyLink: copyLink }, footerLink };
};
