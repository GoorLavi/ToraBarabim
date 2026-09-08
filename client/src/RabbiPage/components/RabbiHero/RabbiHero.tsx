import classNames from 'classnames';
import styled from 'styled-components';

import { rabbiMetaLabel } from '~/RabbiPage/helpers';

import type { RabbiHeroProps } from './models';
import * as styles from './styles';

// The poster is the page (design spec, "the guidance frame states the
// intent in one line"). A rabbi with no photo closes the poster slot
// entirely rather than showing a placeholder fill, the same bounded
// exception the lesson page has (design-system.md, "Rabbi image fallback"),
// extended here with the human's explicit approval (design spec, "No
// photo").
export const RabbiHero = styled(({ className, rabbi }: RabbiHeroProps) => (
  <div className={classNames(className, { noPhoto: !rabbi.photoUrl })}>
    {rabbi.photoUrl && <img className="poster" src={rabbi.photoUrl} alt="" />}

    <div className="names">
      <h1 className="name" dir="auto">
        {rabbi.name}
      </h1>
      {rabbi.title && (
        <p className="title" dir="auto">
          {rabbi.title}
        </p>
      )}
      <p className="meta">{rabbiMetaLabel(rabbi)}</p>
    </div>
  </div>
))`
  ${styles.RabbiHero}
`;
