import type { VisitorMessageType } from '@torabarabim/common';

import { VISITOR_MESSAGE_TITLES } from '~/HomePage/consts';

import type { RailItemTint } from '~/HomePage/components/RailItemShell/models';

export interface MessageTileCopy {
  title: string;
  line: string;
  buttonLabel: string;
}

// The two tiles differ only in this data and their tint, so one component
// renders both.
export const MESSAGE_TILE_COPY: Record<VisitorMessageType, MessageTileCopy> = {
  'rabbi-request': {
    title: VISITOR_MESSAGE_TITLES['rabbi-request'],
    line: 'עזרו לנו להוסיף אותם.',
    buttonLabel: 'בקשה להוספה',
  },
  volunteer: {
    title: VISITOR_MESSAGE_TITLES.volunteer,
    line: 'קצת זמן בשבוע, ועוד אדם מוצא את דרכו לשיעור תורה.',
    buttonLabel: 'הצטרפות למתנדבים',
  },
};

export const MESSAGE_TILE_TINTS: Record<VisitorMessageType, RailItemTint> = {
  'rabbi-request': 'primarySoft',
  volunteer: 'accentSoft',
};

// Feather Icons' "user-plus" (MIT licensed) and "heart", redrawn as single
// paths at this codebase's own stroke width, viewBox 0 0 24 24.
export const MESSAGE_TILE_ICON_PATHS: Record<VisitorMessageType, string> = {
  'rabbi-request': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM20 8v6M23 11h-6',
  volunteer:
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
};
