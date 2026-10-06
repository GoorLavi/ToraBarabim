import type { InstallPlatformPath } from '~/analytics/consts';

// Two dismissals end the automatic card for good.
export const MAX_INSTALL_DISMISSALS = 2;

// Visible seconds on public pages before the automatic card may open. Read
// by the timer hook; defined here so the cadence has one home.
export const AUTO_SHOW_AFTER_VISIBLE_SECONDS = 15;

export const INSTALL_PROMPT_STORAGE_KEY = 'torabarabim:installPrompt';
export const INSTALL_PROMPT_SESSION_KEY = 'torabarabim:installPromptShownThisSession';

// The paths where the card may open by itself. The rest are reachable from
// the footer link only: instructions for a browser we cannot detect well
// should be asked for, not pushed.
export const AUTOMATIC_INSTALL_PATHS: ReadonlySet<InstallPlatformPath> = new Set<InstallPlatformPath>([
  'chromiumPrompt',
  'iosSafari',
  'iosOtherBrowser',
]);

// Apps that embed their own browser, where "add to home screen" is not on
// offer. Matched on the tokens these apps add to the user agent.
export const IN_APP_BROWSER_USER_AGENT_PATTERN =
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|musical_ly|BytedanceWebview|TikTok|Snapchat|Twitter|LinkedInApp|Pinterest|GSA\/|; wv\)/;

export const IOS_USER_AGENT_PATTERN = /iPhone|iPad|iPod/;

// iPadOS 13 and later reports a Macintosh user agent; touch points are the
// only tell, since no Mac has a touch screen.
export const MACINTOSH_USER_AGENT_PATTERN = /Macintosh/;
export const IPADOS_MIN_TOUCH_POINTS = 2;

export const IOS_OTHER_BROWSER_USER_AGENT_PATTERN = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Brave/;
export const SAFARI_TOKEN_PATTERN = /Safari\//;

export const ANDROID_USER_AGENT_PATTERN = /Android/;

export const IPAD_USER_AGENT_PATTERN = /iPad/;

// What an open sheet, dialog, popover or list box looks like in the DOM: the
// picker popovers, the pinned header's expand panel and every sheet carry one
// of these roles. The install card itself is a region, so it never matches.
export const OPEN_OVERLAY_SELECTOR = '[role="dialog"], [role="alertdialog"], [role="listbox"]';

export const MS_PER_SECOND = 1000;
export const AUTO_SHOW_TICK_MS = MS_PER_SECOND;
// The most one tick may add to the visible time. A locked phone stops timers
// and a hidden desktop tab runs them about once a minute, so a tick that
// arrives long after the last one must not count the whole gap.
export const MAX_COUNTED_TICK_MS = 2 * AUTO_SHOW_TICK_MS;

export const SHEET_ARIA_LABEL = 'הוספת האתר למסך הבית';
export const COMPUTER_SHEET_ARIA_LABEL = 'הוספת האתר למחשב';
export const PHONE_FOOTER_LINK_LABEL = 'הוספה למסך הבית';
export const COMPUTER_FOOTER_LINK_LABEL = 'הוספה למחשב';
