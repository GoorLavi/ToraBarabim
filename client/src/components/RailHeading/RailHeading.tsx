import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { splitLastWord } from './helpers';
import type { RailHeadingProps } from './models';
import * as styles from './styles';

// The one `h2` a rail and its loading skeleton share, so the two can never
// disagree on the heading's size or height. Plain text by default; with
// `titleTo` the whole title is a single 48px link, so the section has one
// string and one target rather than a heading plus a see-all link repeating it.
// The chevron sits right after the last word, however the title wraps.
export const RailHeading = styled(({ className, title, titleTo }: RailHeadingProps) => {
  const { lead, last } = splitLastWord(title);

  return (
    <h2 className={classNames(className, { linked: Boolean(titleTo) })} dir="auto">
      {titleTo ? (
        <Link className="link" to={titleTo}>
          {lead}
          <span className="tail">
            {last}
            <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      ) : (
        title
      )}
    </h2>
  );
})`
  ${styles.RailHeading}
`;
