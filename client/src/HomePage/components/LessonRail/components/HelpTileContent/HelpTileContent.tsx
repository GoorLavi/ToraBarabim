import classNames from 'classnames';
import styled from 'styled-components';

import type { HelpTileContentProps } from './models';
import * as styles from './styles';

// Spans only: this sits inside a button or an anchor, where block elements
// and headings are not valid content.
export const HelpTileContent = styled(({ className, icon, title, line, buttonLabel, iconCircle }: HelpTileContentProps) => (
  <span className={className}>
    <span className="group">
      <span className={classNames('icon', iconCircle)} aria-hidden="true">
        {icon}
      </span>
      <span className="title">{title}</span>
      <span className="line">{line}</span>
    </span>
    <span className="pill">{buttonLabel}</span>
  </span>
))`
  ${styles.HelpTileContent}
`;
