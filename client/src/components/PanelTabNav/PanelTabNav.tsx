import type { CSSProperties } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { gridColumns } from './helpers';
import type { PanelTabNavProps } from './models';
import * as styles from './styles';

// The rabbi panel's and the admin panel's shared tab strip: a flex row of
// pill tabs from `md` up, a grid below it (styles.ts). The column count is
// read from the item count, so a caller cannot drift it out of step with how
// many tabs it renders; the only thing a caller passes is the count to fall
// back to on the narrowest phones, if its tabs do not fit the usual one.
export const PanelTabNav = styled(({ className, ariaLabel, items, narrowColumns }: PanelTabNavProps) => (
  <nav
    className={className}
    aria-label={ariaLabel}
    style={{ '--panel-tab-columns': gridColumns(items.length), '--panel-tab-narrow-columns': narrowColumns ?? gridColumns(items.length) } as CSSProperties}
  >
    {items.map((item) => (
      <NavLink key={item.to} to={item.to} className={({ isActive }) => classNames('tab', { active: isActive })} onClick={item.onClick}>
        {item.label}
      </NavLink>
    ))}
  </nav>
))`
  ${styles.PanelTabNav}
`;
