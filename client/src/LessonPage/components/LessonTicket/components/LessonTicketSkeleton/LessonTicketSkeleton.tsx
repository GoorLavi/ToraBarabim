import styled from 'styled-components';

import { TicketShell } from '~/LessonPage/components/LessonTicket/styles';

import type { LessonTicketSkeletonProps } from './models';
import * as styles from './styles';

// The ticket's silhouette with its own internal shape filled in: a poster
// block, date and time blocks, and text bars standing in for every line the
// loaded ticket will show (design spec, "Loading"). That structure, not
// motion, is what makes a static skeleton legible, so nothing here shimmers
// or pulses.
export const LessonTicketSkeleton = styled(({ className }: LessonTicketSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="ticketRow">
      <div className="stub">
        <span className="notch start" />
        <span className="notch end" />

        <span className="bar kicker" />

        <div className="whenRow">
          <div className="dateCol">
            <span className="bar weekday" />
            <span className="bar day" />
            <span className="bar month" />
          </div>

          <span className="hairline" />

          <div className="timeCol">
            <span className="bar time" />
            <span className="bar endTime" />
            <span className="bar duration" />
          </div>
        </div>
      </div>

      <div className="body">
        <div className="place">
          <span className="bar venue" />
          <span className="bar address" />
          <span className="bar city" />
          <span className="bar tag" />
        </div>

        <span className="hairline" />

        <div className="teacherRow">
          <div className="teacher">
            <span className="bar role" />
            <span className="bar name" />
          </div>

          <span className="poster" />
        </div>
      </div>
    </div>
  </div>
))`
  ${TicketShell}
  ${styles.LessonTicketSkeleton}
`;
