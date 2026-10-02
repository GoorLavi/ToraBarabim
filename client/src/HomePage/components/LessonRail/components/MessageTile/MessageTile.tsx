import { RailItemShell } from '~/HomePage/components/RailItemShell/RailItemShell';

import { helpTileAccessibleName } from '../../helpers';
import { HelpTileContent } from '../HelpTileContent/HelpTileContent';
import * as consts from './consts';
import type { MessageTileProps } from './models';

// A button, not a link: it opens the window HomeRails owns. Before
// hydration it does nothing, the same posture as the dedication band.
export const MessageTile = ({ kind, onPress }: MessageTileProps) => {
  const { title, line, buttonLabel } = consts.MESSAGE_TILE_COPY[kind];

  return (
    <RailItemShell
      {...{
        variant: 'tinted' as const,
        tint: consts.MESSAGE_TILE_TINTS[kind],
        renderRoot: (rootClassName, content) => (
          <button type="button" className={rootClassName} aria-label={helpTileAccessibleName(title, buttonLabel)} onClick={(event) => onPress(event.currentTarget)}>
            {content}
          </button>
        ),
      }}
    >
      <HelpTileContent
        {...{
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={consts.MESSAGE_TILE_ICON_PATHS[kind]} />
            </svg>
          ),
          title,
          line,
          buttonLabel,
          iconCircle: 'surface' as const,
        }}
      />
    </RailItemShell>
  );
};
