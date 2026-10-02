import type { HelpTileKind } from '@torabarabim/common';

import type { HelpTileEventKind } from '~/analytics/models';

export const PREV_LABEL = 'לשיעורים הקודמים';
export const NEXT_LABEL = 'לשיעורים הבאים';

// What a press on each help tile is called in the event: the wire's own
// `rabbi-request` is a hyphenated word, the event's is a plain label.
export const HELP_TILE_EVENT_KINDS: Record<HelpTileKind, HelpTileEventKind> = {
  'rabbi-request': 'rabbiRequest',
  volunteer: 'volunteer',
  share: 'share',
};
