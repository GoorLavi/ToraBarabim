export const OPEN_PANEL_LABEL = 'פתיחת הסינון';
export const changePanelLabel = (summary: string): string => `שינוי הסינון: ${summary}`;
export const FILTER_LABEL = 'סינון';

// The label's real budget at 375: 343 usable minus the 126px logo minus the
// 12px gap between them leaves 205, so 200 is the practical ceiling on a
// phone.
export const LABEL_MAX_WIDTH_PHONE_PX = 200;
export const LABEL_MAX_WIDTH_DESKTOP_PX = 280;
