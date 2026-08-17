import styled from 'styled-components';

import * as consts from './consts';
import type { RabbiPreviewCardProps } from './models';
import * as styles from './styles';

// Mirrors the public site's `RabbiAvatar`/`LessonCard` poster treatment
// (client/CLAUDE.md: fed by the form's live draft, so this is its own
// small component rather than a direct reuse).
export const RabbiPreviewCard = styled(({ className, photoUrl, name }: RabbiPreviewCardProps) => (
  <div className={className}>
    <p className="label">{consts.PREVIEW_LABEL}</p>
    <div className="card">
      {photoUrl ? <img className="photo" src={photoUrl} alt="" /> : <div className="photo placeholder" aria-hidden="true" />}
      <p className="name" dir="auto">
        {name || consts.NO_NAME_PLACEHOLDER}
      </p>
    </div>
  </div>
))`
  ${styles.RabbiPreviewCard}
`;
