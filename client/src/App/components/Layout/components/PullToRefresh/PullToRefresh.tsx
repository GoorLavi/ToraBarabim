import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { isStandaloneDisplay } from '~/pwa/isStandaloneDisplay';

import * as consts from './consts';
import type { PullToRefreshProps } from './models';
import * as styles from './styles';
import { usePullToRefresh } from './usePullToRefresh';

const reloadPage = (): void => window.location.reload();

// An installed app has no address bar and no browser pull-to-refresh, so
// this gives its public pages one. Mounted only in the public Layout, never
// in a panel: a full reload there would discard an unsaved form.
export const PullToRefresh = styled(({ className, onRefresh = reloadPage }: PullToRefreshProps) => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
  }, []);

  const { status, indicatorRef } = usePullToRefresh({ isActive: isStandalone, onRefresh });

  if (!isStandalone) return null;

  const statusText = { idle: '', pulling: '', ready: consts.PULL_READY_LABEL, refreshing: consts.REFRESHING_LABEL }[status];

  return (
    <div className={classNames(className, status)} ref={indicatorRef}>
      <span className="spinner" aria-hidden="true">
        <svg className="ring" viewBox="0 0 24 24" width="24" height="24" fill="none">
          <circle className="track" cx="12" cy="12" r={consts.RING_RADIUS} />
          <circle className="arc" cx="12" cy="12" r={consts.RING_RADIUS} />
        </svg>
      </span>
      <span className="statusText" role="status">
        {statusText}
      </span>
    </div>
  );
})`
  ${styles.PullToRefresh}
`;
