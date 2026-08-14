import styled from 'styled-components';

import type { RabbiAvatarProps } from './models';
import * as styles from './styles';

// Same plain-fill placeholder treatment as LessonCard when photoUrl is
// absent, kept in one spot in each so a single edit updates both.
export const RabbiAvatar = styled(({ className, rabbi }: RabbiAvatarProps) => (
  <div className={className}>
    {rabbi.photoUrl ? (
      <img className="photo" src={rabbi.photoUrl} alt="" />
    ) : (
      <div className="photo placeholder" aria-hidden="true" />
    )}
    <span className="name" dir="auto">
      {rabbi.name}
    </span>
  </div>
))`
  ${styles.RabbiAvatar}
`;
