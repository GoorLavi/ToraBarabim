import type { HelpTileKind } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { LESSONS_NEXT_LABEL, LESSONS_PREV_LABEL } from '~/components/Rail/consts';
import { Rail } from '~/components/Rail/Rail';
import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import { MessageTile } from './components/MessageTile/MessageTile';
import { ShareTile } from './components/ShareTile/ShareTile';
import { WomensAreaTile } from './components/WomensAreaTile/WomensAreaTile';
import * as consts from './consts';
import { railSlots } from './helpers';
import type { LessonRailProps } from './models';

// Owns nothing but the lesson-specific slotting (the women's-area tile and
// the help tile splices) and the items it can render; the row itself, its
// arrows and its scroll tracking are `Rail`'s (components/Rail).
export const LessonRail = ({
  className,
  rowId,
  title,
  items,
  womensAreaTileIndex,
  womensAreaLessonCount,
  helpTile,
  onOpenHelpTile,
}: LessonRailProps) => {
  const slots = railSlots(items, womensAreaTileIndex, helpTile);

  const trackHelpTilePress = (kind: HelpTileKind, position: number): void => {
    trackEvent(MIXPANEL_EVENTS.helpTileClick, { tile: consts.HELP_TILE_EVENT_KINDS[kind], rowId, position });
  };

  return (
    <Rail {...{ className, title, prevLabel: LESSONS_PREV_LABEL, nextLabel: LESSONS_NEXT_LABEL }}>
      {slots.map((slot, index) => {
        if (slot.kind === 'lesson') {
          return (
            <li key={`${slot.lesson.lessonId}-${slot.lesson.date}`}>
              <LessonCard
                {...{
                  lesson: slot.lesson,
                  surface: 'general',
                  clickContext: { surface: 'homeRail' as const, railTitle: title, position: index },
                }}
              />
            </li>
          );
        }

        if (slot.kind === 'womensArea') {
          return (
            <li key="womens-area">
              <WomensAreaTile {...{ lessonCount: womensAreaLessonCount }} />
            </li>
          );
        }

        if (slot.helpKind === 'share') {
          return (
            <li key="help-share">
              <ShareTile {...{ onPress: () => trackHelpTilePress('share', index) }} />
            </li>
          );
        }

        const messageKind = slot.helpKind;
        return (
          <li key={`help-${messageKind}`}>
            <MessageTile
              {...{
                kind: messageKind,
                onPress: (opener) => {
                  trackHelpTilePress(messageKind, index);
                  onOpenHelpTile(messageKind, opener);
                },
              }}
            />
          </li>
        );
      })}
    </Rail>
  );
};
