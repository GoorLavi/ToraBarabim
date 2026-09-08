import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { rabbiMetaLine } from './helpers';
import type { RabbiListRowProps } from './models';
import * as styles from './styles';

// The stored name already carries its own honorific (a הרבנית appears in the
// data), so it renders exactly as given: never prepended, never re-sorted
// (design spec, "all-rabbis, the index").
export const RabbiListRow = styled(({ className, rabbi }: RabbiListRowProps) => (
  <Link to={`/rabbis/${rabbi.id}`} className={className}>
    <div className={classNames('avatar', { placeholder: !rabbi.photoUrl })}>
      {rabbi.photoUrl && <img className="photo" src={rabbi.photoUrl} alt="" />}
    </div>

    <div className="text">
      <span className="name" dir="auto">
        {rabbi.name}
      </span>
      <span className="meta" dir="auto">
        {rabbiMetaLine(rabbi)}
      </span>
    </div>

    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
))`
  ${styles.RabbiListRow}
`;
