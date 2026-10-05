import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, DETAILS_LABEL, lessonNewForRabbi } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/RabbisListPage/consts';
import { rabbiDisplayName } from '~/helpers';

import type { RabbiCardProps } from './models';
import * as styles from './styles';

// Same graceful photo fallback as the public site's `RabbiAvatar`/
// `LessonCard`: a plain, undecorated fill, never initials or a silhouette.
// A photo that fails to load (a stale or broken URL) falls back the same
// way as no photo at all, rather than the browser's broken-image glyph.
export const RabbiCard = styled(({ className, rabbi }: RabbiCardProps) => {
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  return (
    <article className={className}>
      {rabbi.photoUrl && !hasLoadFailed ? (
        <img className="photo" src={rabbi.photoUrl} alt="" onError={() => setHasLoadFailed(true)} />
      ) : (
        <div className="photo placeholder" aria-hidden="true" />
      )}

      <div className="body">
        <h3 className="name" dir="auto">
          {rabbiDisplayName(rabbi)}
        </h3>
        <p className="count">{rabbi.lessonCount === 0 ? parentConsts.NO_LESSONS_YET_LABEL : parentConsts.lessonCountLabel(rabbi.lessonCount)}</p>

        <div className="actions">
          <Link className="edit" to={ADMIN_ROUTES.rabbiView(rabbi.id)}>
            {DETAILS_LABEL}
          </Link>
          <Link className="newLesson" to={lessonNewForRabbi(rabbi.id)}>
            {parentConsts.NEW_LESSON_LABEL}
          </Link>
        </div>
      </div>
    </article>
  );
})`
  ${styles.RabbiCard}
`;
