import type { ThemeName } from '~/theme/models';

export interface ThemeSwitcherProps {
  className?: string;
  themeName: ThemeName;
  onSelect: (themeName: ThemeName) => void;
}
