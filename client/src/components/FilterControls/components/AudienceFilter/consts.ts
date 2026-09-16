import { AUDIENCE_LABELS } from '~/consts';

import type { AudienceOption } from './models';

export const ALL_AUDIENCES_LABEL = 'כל הקהלים';

// The full mixed label does not fit the button at phone width. The owner
// approved this short form for the button only; the list and every lesson
// card keep the full label.
export const MIXED_BUTTON_LABEL = 'גברים ונשים';

export const OPTION_LABELS: Record<AudienceOption, string> = { all: 'הכל', ...AUDIENCE_LABELS };

export const AUDIENCE_OPTIONS: AudienceOption[] = ['all', 'men', 'women', 'mixed'];

export const POPOVER_TITLE = 'סינון לפי קהל';
export const CLOSE_LABEL = 'סגירה';
export const WOMEN_SUBLABEL = 'מעבר ללוח השיעורים לנשים';
