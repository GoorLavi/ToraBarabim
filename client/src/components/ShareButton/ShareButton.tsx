import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';

import * as consts from './consts';
import { isShareDismissal, textWithUrlOnLastLine } from './helpers';
import type { CopyStatus, ShareButtonProps } from './models';
import * as styles from './styles';

// Same markup on the server and the client: whether the browser can share
// natively is read on click, never at render, so there is no hydration
// mismatch to manage.
export const ShareButton = styled(({ className, text, url, tone, surface }: ShareButtonProps) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (copyStatus !== 'copied') return;
    const timer = setTimeout(() => setCopyStatus('idle'), consts.COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  const copyUrl = async (): Promise<void> => {
    trackEvent(MIXPANEL_EVENTS.shareClick, { surface, method: 'copy' });
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch (error) {
      // Fails open: the person is shown the link to copy by hand rather than
      // being told nothing happened.
      console.warn(`Could not copy the link to ${url}`, error);
      setCopyStatus('failed');
    }
  };

  const share = async (): Promise<void> => {
    if (typeof navigator.share !== 'function') {
      await copyUrl();
      return;
    }
    try {
      await navigator.share({ text: textWithUrlOnLastLine(text, url) });
      trackEvent(MIXPANEL_EVENTS.shareClick, { surface, method: 'native' });
    } catch (error) {
      if (isShareDismissal(error)) return;
      // Fails open to copying: a share sheet that errors for any reason other
      // than being closed must not leave the person with no way to send it.
      console.warn(`The share sheet failed for ${url}`, error);
      await copyUrl();
    }
  };

  const isCopied = copyStatus === 'copied';

  return (
    <div className={classNames(className, tone)}>
      <button type="button" className="button" onClick={() => void share()}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d={isCopied ? consts.CHECK_ICON_PATH : consts.SHARE_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Both labels share one grid cell, so the button is always as wide
            as the longer of the two and never jumps on the swap. */}
        <span className={classNames('label', { hidden: isCopied })}>{consts.SHARE_LABEL}</span>
        <span className={classNames('label', { hidden: !isCopied })}>{consts.COPIED_LABEL}</span>
      </button>
      <p className={classNames('notice', { visuallyHidden: copyStatus !== 'failed' })} role="status">
        {copyStatus === 'copied' && consts.COPIED_LABEL}
        {copyStatus === 'failed' && consts.COPY_FAILED_LINE}
      </p>
      {copyStatus === 'failed' && <ReadOnlyField className="fallback" value={url} dir="ltr" />}
    </div>
  );
})`
  ${styles.ShareButton}
`;
