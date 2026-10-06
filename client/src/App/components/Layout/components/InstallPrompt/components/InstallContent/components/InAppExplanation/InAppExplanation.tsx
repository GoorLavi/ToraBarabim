import classNames from 'classnames';
import { useState } from 'react';
import styled from 'styled-components';

import { PrimaryButton } from '~/components/PrimaryButton/PrimaryButton';
import { QuietButton } from '~/components/QuietButton/QuietButton';

import { InstallIcon } from '~/App/components/Layout/components/InstallIcon/InstallIcon';
import * as consts from '../../consts';
import type { InAppExplanationProps } from './models';
import * as styles from './styles';

export const InAppExplanation = styled(({ className, onCopyLink, onClose }: InAppExplanationProps) => {
  const [isCopied, setIsCopied] = useState(false);
  // The page link, set only when copying failed, so it can be offered as text
  // to press and hold.
  const [linkToCopyByHand, setLinkToCopyByHand] = useState<string | null>(null);

  const copyLink = (): void => {
    onCopyLink()
      .then(() => setIsCopied(true))
      .catch((error: unknown) => {
        console.error('Could not copy the page link from the in-app browser explanation', error);
        setLinkToCopyByHand(window.location.href);
      });
  };

  return (
    <div className={className}>
      <p className="headline">{consts.IN_APP_HEADLINE}</p>
      <p className="line">
        {consts.IN_APP_LINE_BEFORE_BROWSERS}
        <bdi>{consts.IN_APP_BROWSER_NAMES.first}</bdi>
        {consts.IN_APP_LINE_BETWEEN_BROWSERS}
        <bdi>{consts.IN_APP_BROWSER_NAMES.second}</bdi>
        {consts.IN_APP_LINE_AFTER_BROWSERS}
      </p>

      <div className="hint">
        <p className="hintText">{consts.IN_APP_HINT}</p>
        <span className="tile" aria-hidden="true">
          <InstallIcon name="menuDotsCircle" size={26} />
        </span>
      </div>

      <PrimaryButton
        {...{
          className: classNames('copy', { copied: isCopied }),
          label: isCopied ? consts.IN_APP_COPIED_LABEL : consts.IN_APP_COPY_LABEL,
          icon: <InstallIcon name={isCopied ? 'check' : 'link'} size={20} />,
          onClick: copyLink,
        }}
      />
      {linkToCopyByHand && (
        <div className="manualCopy" role="status">
          <p className="manualCopyHint">{consts.IN_APP_MANUAL_COPY_HINT}</p>
          <p className="pageLink" dir="ltr">
            {linkToCopyByHand}
          </p>
        </div>
      )}
      <QuietButton {...{ className: 'close', label: consts.IN_APP_CLOSE_LABEL, onClick: onClose }} />
    </div>
  );
})`
  ${styles.InAppExplanation}
`;
