import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { RabbiAvatarProps } from './models';
import * as styles from './styles';

// Same plain-fill placeholder treatment as LessonCard when photoUrl is
// absent, kept in one spot in each so a single edit updates both.
//
// The whole cell is the link, not the photograph alone: tapping a rabbi
// used to do nothing at all. The accessible name is the rabbi's name and
// nothing else, so the photo is decorative (`alt=""`) rather than repeating
// the name a screen reader already announces from the link text.
export const RabbiAvatar = styled(({ className, rabbi }: RabbiAvatarProps) => (
  <Link to={`/rabbis/${rabbi.id}`} className={className}>
    {rabbi.photoUrl ? (
      <img className="photo" src={rabbi.photoUrl} alt="" />
    ) : (
      <div className="photo placeholder" aria-hidden="true" />
    )}
    <span className="name" dir="auto">
      {rabbi.name}
    </span>
  </Link>
))`
  ${styles.RabbiAvatar}
`;
