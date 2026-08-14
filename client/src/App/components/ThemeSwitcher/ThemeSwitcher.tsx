import classNames from 'classnames';
import styled from 'styled-components';

import { THEME_NAMES } from '~/theme/consts';

import * as consts from './consts';
import type { ThemeSwitcherProps } from './models';
import * as styles from './styles';

// A plain, obviously-not-product dev affordance: lets the three ratified
// themes (design-system.md, "Themes and the token contract") be compared in
// the running app. Not a designed feature.
export const ThemeSwitcher = styled(({ className, themeName, onSelect }: ThemeSwitcherProps) => (
  <div className={className} role="group" aria-label={consts.SWITCHER_LABEL}>
    {THEME_NAMES.map((name) => (
      <button
        key={name}
        type="button"
        className={classNames('option', { selected: name === themeName })}
        aria-pressed={name === themeName}
        onClick={() => onSelect(name)}
      >
        {name}
      </button>
    ))}
  </div>
))`
  ${styles.ThemeSwitcher}
`;
