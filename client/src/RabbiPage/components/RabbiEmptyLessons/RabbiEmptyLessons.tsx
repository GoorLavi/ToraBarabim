import styled from 'styled-components';

import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';
import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';
import * as pageConsts from '~/RabbiPage/consts';
import { noLessonsHeading } from '~/RabbiPage/consts';

import * as consts from './consts';
import type { RabbiEmptyLessonsProps } from './models';
import * as styles from './styles';

// The ratified empty state, widened to the one axis this fallback actually
// has: not "this rabbi", but the whole country (design-system.md, "Every
// data screen has three states"; design spec, "the empty state does not
// stay empty"). A failed or still-empty nationwide fetch degrades quietly:
// the rabbi's own "no lessons yet" message above already stands on its own,
// so this block simply does not render rather than showing a second error
// for a fallback that was never the page's main content.
export const RabbiEmptyLessons = styled(
  ({ className, rabbiName, nationwideItems, isNationwidePending, isNationwideError }: RabbiEmptyLessonsProps) => {
    const showGrid = !isNationwideError && (isNationwidePending || (nationwideItems && nationwideItems.length > 0));

    return (
      <div className={className}>
        <StateCard
          variant="empty"
          headingLevel="h2"
          heading={noLessonsHeading(rabbiName)}
          body={pageConsts.NO_LESSONS_BODY}
          action={{ actionLabel: pageConsts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
        />

        {showGrid && (
          <div className="nationwide">
            <div className="heading">
              <h2 className="title">{pageConsts.NATIONWIDE_LESSONS_HEADING}</h2>
              <p className="sub">{pageConsts.NATIONWIDE_LESSONS_SUBHEADING}</p>
            </div>

            {isNationwidePending ? (
              <LessonsGridSkeleton cellCount={consts.SKELETON_CELL_COUNT} />
            ) : (
              <LessonsGrid items={nationwideItems ?? []} />
            )}
          </div>
        )}
      </div>
    );
  },
)`
  ${styles.RabbiEmptyLessons}
`;
