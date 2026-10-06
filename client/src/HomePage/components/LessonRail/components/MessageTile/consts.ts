import type { HelpRequestType } from '@torabarabim/common';

import { VISITOR_MESSAGE_TITLES } from '~/HomePage/components/consts';

import type { RailItemTint } from '~/HomePage/components/RailItemShell/models';

export interface MessageTileCopy {
  title: string;
  line: string;
  buttonLabel: string;
}

// The two tiles differ only in this data and their tint, so one component
// renders both.
export const MESSAGE_TILE_COPY: Record<HelpRequestType, MessageTileCopy> = {
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

export const MESSAGE_TILE_TINTS: Record<HelpRequestType, RailItemTint> = {
  'rabbi-request': 'primarySoft',
  volunteer: 'accentSoft',
};

// Feather Icons' "user-plus" (MIT licensed) and Lucide's "hand-heart" (ISC
// licensed), each joined into one path, viewBox 0 0 24 24, drawn at the
// tile's stroke width of 1.8. A hand holding a heart says "offer your help",
// where a bare heart reads as "save to favourites".
export const MESSAGE_TILE_ICON_PATHS: Record<HelpRequestType, string> = {
  'rabbi-request': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM20 8v6M23 11h-6',
  volunteer:
    'M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12z',
};
