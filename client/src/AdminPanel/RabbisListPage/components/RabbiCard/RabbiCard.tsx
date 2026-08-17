import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import * as parentConsts from '~/AdminPanel/RabbisListPage/consts';

import type { RabbiCardProps } from './models';
import * as styles from './styles';

// Same graceful photo fallback as the public site's `RabbiAvatar`/
// `LessonCard`: a plain, undecorated fill, never initials or a silhouette.
// A photo that fails to load (a stale or broken URL) falls back the same
// way as no photo at all, rather than the browser's broken-image glyph.
export const RabbiCard = styled(({ className, row }: RabbiCardProps) => {
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  return (
    <article className={className}>
      {row.rabbi.photoUrl && !hasLoadFailed ? (
        <img className="photo" src={row.rabbi.photoUrl} alt="" onError={() => setHasLoadFailed(true)} />
      ) : (
        <div className="photo placeholder" aria-hidden="true" />
      )}

      <div className="body">
        <h3 className="name" dir="auto">
          {row.rabbi.name}
        </h3>
        <p className="count">{row.lessonCount === 0 ? parentConsts.NO_LESSONS_YET_LABEL : parentConsts.lessonCountLabel(row.lessonCount)}</p>

        <div className="actions">
          <Link className="edit" to={ADMIN_ROUTES.rabbiEdit(row.rabbi.id)}>
            {parentConsts.EDIT_LABEL}
          </Link>
          <Link className="newLesson" to={`${ADMIN_ROUTES.lessonNew}?rabbiId=${row.rabbi.id}`}>
            {parentConsts.NEW_LESSON_LABEL}
          </Link>
        </div>
      </div>
    </article>
  );
})`
  ${styles.RabbiCard}
`;
