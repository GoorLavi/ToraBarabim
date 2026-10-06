import type { ShareButtonPlacement } from '../../models';
import type { InstructionsContent } from './models';

export const OFFER_HEADLINE = 'שלא תפספסו את השיעור הבא';
export const PHONE_OFFER_LINE = 'תורה ברבים במסך הבית, וכל השיעורים בלחיצה.';
export const PHONE_OFFER_ACCEPT_LABEL = 'הוספה למסך הבית';
export const COMPUTER_OFFER_LINE = 'תורה ברבים במחשב, וכל השיעורים בלחיצה.';
export const COMPUTER_OFFER_ACCEPT_LABEL = 'הוספה למחשב';
export const OFFER_DISMISS_LABEL = 'לא עכשיו';

export const HOME_SCREEN_PREVIEW_CAPTION = 'וכך זה ייראה במסך הבית';
export const HOME_SCREEN_APP_NAME = 'תורה ברבים';

export const INSTRUCTIONS_CLOSE_LABEL = 'הבנתי';

const IOS_STEP_ONE_BOTTOM = {
  id: 'share',
  text: ['לוחצים על כפתור השיתוף בתחתית המסך.'],
  subText: 'אם הכפתור לא מופיע, לוחצים קודם על שלוש הנקודות.',
  tile: { icon: 'share' },
} as const;

const IOS_STEP_ONE_TOP = {
  id: 'share',
  text: ['לוחצים על כפתור השיתוף ', { icon: 'share' }, ' בראש המסך.'],
} as const;

export const iosInstructions = (shareButtonPlacement: ShareButtonPlacement): InstructionsContent => ({
  headline: 'כך מוסיפים למסך הבית',
  steps: [
    shareButtonPlacement === 'bottom' ? IOS_STEP_ONE_BOTTOM : IOS_STEP_ONE_TOP,
    { id: 'addToHomeScreen', text: ['גוללים ובוחרים "הוסף למסך הבית".'], tile: { icon: 'addToHomeScreen' } },
    { id: 'confirm', text: ['לוחצים על "הוסף" בפינה העליונה.'], tile: { label: 'הוסף' } },
  ],
  hasHomeScreenPreview: true,
  closeLabel: INSTRUCTIONS_CLOSE_LABEL,
});

export const BROWSER_MENU_INSTRUCTIONS: InstructionsContent = {
  headline: 'הוספה דרך תפריט הדפדפן',
  steps: [
    { id: 'openMenu', text: ['פותחים את תפריט הדפדפן בפינה העליונה.'], tile: { icon: 'menuDots' } },
    {
      id: 'addToHomeScreen',
      text: ['בוחרים "הוספה למסך הבית".'],
      subText: 'בחלק מהמכשירים האפשרות נקראת "התקנת האפליקציה".',
      tile: { icon: 'addToHomeScreen' },
    },
  ],
  hasHomeScreenPreview: false,
  note: 'אם האפשרות לא מופיעה, ייתכן שהאתר כבר נמצא במסך הבית.',
  closeLabel: INSTRUCTIONS_CLOSE_LABEL,
};

export const IN_APP_HEADLINE = 'קודם פותחים את האתר בדפדפן';
export const IN_APP_LINE_BEFORE_BROWSERS = 'כדי להוסיף את האתר למסך הבית, צריך לפתוח אותו בדפדפן ';
export const IN_APP_LINE_BETWEEN_BROWSERS = ' או ';
export const IN_APP_LINE_AFTER_BROWSERS = '.';
export const IN_APP_BROWSER_NAMES = { first: 'Safari', second: 'Chrome' } as const;
export const IN_APP_HINT = 'בדרך כלל עושים את זה דרך התפריט בפינה העליונה.';
export const IN_APP_COPY_LABEL = 'העתקת הקישור';
export const IN_APP_COPIED_LABEL = 'הקישור הועתק';
export const IN_APP_CLOSE_LABEL = 'הבנתי';
