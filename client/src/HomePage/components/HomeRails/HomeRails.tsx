import classNames from 'classnames';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { CourseRail } from '~/components/CourseRail/CourseRail';
import { RailSkeleton } from '~/components/RailSkeleton/RailSkeleton';

import { DedicationBand } from '../DedicationBand/DedicationBand';
import { LessonRail } from '../LessonRail/LessonRail';
import { WomensAreaBand } from '../WomensAreaBand/WomensAreaBand';
import { HelpWindow } from './components/HelpWindow/HelpWindow';
import * as consts from './consts';
import { dedicationBandSlot, indexAfterNthLessonRow, shouldShowBetweenRailsDedication } from './helpers';
import type { HomeRailsProps } from './models';
import * as styles from './styles';
import { useHelpWindow } from './useHelpWindow';

export const HomeRails = styled(({ className, query, dedicationGroup }: HomeRailsProps) => {
  const helpWindow = useHelpWindow();

  const { openKind } = helpWindow;

  // The window is a portal, so where it sits in this tree is irrelevant, but
  // it is rendered whichever state the rails are in: a refetch that fails or
  // comes back empty while a visitor is typing replaces the rails, and the
  // window and its draft must not vanish with them. Pending is left out: a
  // window can only have been opened from a tile, so there is data by then.
  const withHelpWindow = (content: ReactNode): ReactNode => (
    <>
      {content}
      {openKind && (
        <HelpWindow
          {...{
            kind: openKind,
            draft: helpWindow.drafts[openKind],
            status: helpWindow.sendStatuses[openKind],
            onDraftChange: (draft) => helpWindow.changeDraft(openKind, draft),
            onSubmit: () => helpWindow.send(openKind),
            onDismiss: helpWindow.close,
          }}
        />
      )}
    </>
  );

  if (query.isError) {
    return withHelpWindow(
      <div className={classNames(className, 'error')} role="alert">
        <p className="headline">{consts.ERROR_HEADLINE}</p>
        <p className="hint">{consts.ERROR_HINT}</p>
        <button
          type="button"
          className="retry"
          onClick={() => {
            trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'homeRails' });
            query.refetch();
          }}
        >
          {consts.RETRY_LABEL}
        </button>
      </div>,
    );
  }

  if (query.isPending) {
    return (
      <div className={className} aria-busy="true">
        <span className="srOnly" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </span>
        {consts.SKELETON_RAIL_KEYS.map((key) => (
          <RailSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!query.data) return null;

  if (query.data.rows.length === 0) {
    return withHelpWindow(
      <div className={classNames(className, 'empty')}>
        <p className="headline">{consts.EMPTY_HEADLINE}</p>
      </div>,
    );
  }

  const { rows, womensAreaLessonCount } = query.data;

  const rails: ReactNode[] = rows.map((row) =>
    row.kind === 'lessons' ? (
      <LessonRail
        key={row.id}
        {...{
          rowId: row.id,
          title: row.title,
          items: row.items,
          womensAreaTileIndex: row.womensAreaTileIndex,
          womensAreaLessonCount,
          helpTile: row.helpTile,
          onOpenHelpTile: helpWindow.open,
        }}
      />
    ) : (
      <CourseRail key={row.id} {...{ title: row.title, items: row.items, surface: 'general' as const, clickSurface: 'homeRail' as const }} />
    ),
  );

  const lessonRowCount = rows.filter((row) => row.kind === 'lessons').length;
  // With no lesson rows at all (the course row alone), neither band has a
  // real "after the Nth lesson row" slot to sit in, so showing one would
  // land it oddly right after the course row instead (plan addendum).
  const showWomensAreaBand = womensAreaLessonCount > 0 && lessonRowCount > 0;
  const showBetweenRailsDedication = shouldShowBetweenRailsDedication(
    lessonRowCount,
    dedicationGroup !== undefined && dedicationGroup.items.length > 0,
  );

  // Computed once against the original `rows` (never against `rails` after
  // a splice moves everything after it), and reused for both bands so the
  // dedication band's own placement stays relative to it (helpers.ts).
  const womensAreaBandIndex = indexAfterNthLessonRow(rows, consts.WOMENS_AREA_BAND_SLOT);

  if (showWomensAreaBand) {
    rails.splice(womensAreaBandIndex, 0, <WomensAreaBand key="womens-area-band" {...{ lessonCount: womensAreaLessonCount }} />);
  }

  if (showBetweenRailsDedication) {
    rails.splice(
      dedicationBandSlot(womensAreaBandIndex, showWomensAreaBand),
      0,
      <DedicationBand key="dedication-band" {...{ group: dedicationGroup, variant: 'onPage' as const }} />,
    );
  }

  return withHelpWindow(<div className={className}>{rails}</div>);
})`
  ${styles.HomeRails}
`;
