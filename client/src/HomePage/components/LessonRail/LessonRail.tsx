import { Rail } from '~/components/Rail/Rail';
import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import { WomensAreaTile } from './components/WomensAreaTile/WomensAreaTile';
import * as consts from './consts';
import { railSlots } from './helpers';
import type { LessonRailProps } from './models';

// Owns nothing but the lesson-specific slotting (the women's-area tile
// splice) and the two cards it can render; the row itself, its arrows and
// its scroll tracking are `Rail`'s (components/Rail).
export const LessonRail = ({ className, title, items, womensAreaTileIndex, womensAreaLessonCount }: LessonRailProps) => {
  const slots = railSlots(items, womensAreaTileIndex);

  return (
    <Rail {...{ className, title, prevLabel: consts.PREV_LABEL, nextLabel: consts.NEXT_LABEL }}>
      {slots.map((slot, index) =>
        slot.kind === 'lesson' ? (
          <li key={`${slot.lesson.lessonId}-${slot.lesson.date}`}>
            <LessonCard
              {...{
                lesson: slot.lesson,
                surface: 'general',
                clickContext: { surface: 'homeRail' as const, railTitle: title, position: index },
              }}
            />
          </li>
        ) : (
          <li key="womens-area">
            <WomensAreaTile {...{ lessonCount: womensAreaLessonCount }} />
          </li>
        ),
      )}
    </Rail>
  );
};
