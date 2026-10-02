import { RailItemShell } from '~/HomePage/components/RailItemShell/RailItemShell';
import { WHATSAPP_ICON_PATH } from '~/consts';
import { whatsAppHref } from '~/helpers';

import { helpTileAccessibleName } from '../../helpers';
import { HelpTileContent } from '../HelpTileContent/HelpTileContent';
import * as consts from './consts';
import type { ShareTileProps } from './models';

// A plain link, so it works before any script has run. It opens WhatsApp's
// own contact picker with the prepared message.
export const ShareTile = ({ onPress }: ShareTileProps) => (
  <RailItemShell
    {...{
      variant: 'surface' as const,
      renderRoot: (rootClassName, content) => (
        <a
          href={whatsAppHref(consts.SHARE_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className={rootClassName}
          aria-label={helpTileAccessibleName(consts.TILE_TITLE, consts.TILE_BUTTON_LABEL)}
          onClick={onPress}
        >
          {content}
        </a>
      ),
    }}
  >
    <HelpTileContent
      {...{
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={WHATSAPP_ICON_PATH} />
          </svg>
        ),
        title: consts.TILE_TITLE,
        line: consts.TILE_LINE,
        buttonLabel: consts.TILE_BUTTON_LABEL,
        iconCircle: 'primarySoft' as const,
      }}
    />
  </RailItemShell>
);
