import styled from 'styled-components';

import { LogoMark } from '~/components/LogoMark/LogoMark';
import { QuietButton } from '~/components/QuietButton/QuietButton';

import { InstallIcon } from '../../../InstallIcon/InstallIcon';
import * as consts from '../../consts';
import type { InstallStepsProps } from './models';
import * as styles from './styles';

export const InstallSteps = styled(({ className, content, onClose }: InstallStepsProps) => (
  <div className={className}>
    <p className="headline">{content.headline}</p>

    <ol className="steps">
      {content.steps.map((step, index) => (
        <li key={step.id} className="step">
          <span className="number" aria-hidden="true">
            {index + 1}
          </span>
          <div className="body">
            <p className="text">
              {step.text.map((part) =>
                typeof part === 'string' ? part : <InstallIcon key={part.icon} className="inlineIcon" name={part.icon} size={20} />,
              )}
            </p>
            {step.subText && <p className="subText">{step.subText}</p>}
          </div>
          {step.tile && (
            <span className="tile" aria-hidden="true">
              {'icon' in step.tile ? <InstallIcon name={step.tile.icon} size={26} /> : <span className="tileLabel">{step.tile.label}</span>}
            </span>
          )}
        </li>
      ))}
    </ol>

    {content.hasHomeScreenPreview && (
      <div className="preview">
        <p className="caption">{consts.HOME_SCREEN_PREVIEW_CAPTION}</p>
        <div className="app" aria-hidden="true">
          <span className="appIcon">
            <LogoMark size={40} variant="onDark" />
          </span>
          <span className="appName">{consts.HOME_SCREEN_APP_NAME}</span>
        </div>
      </div>
    )}

    {content.note && <p className="note">{content.note}</p>}

    <QuietButton {...{ className: 'close', label: content.closeLabel, onClick: onClose }} />
  </div>
))`
  ${styles.InstallSteps}
`;
