export type InstallIconName = 'share' | 'addToHomeScreen' | 'menuDots' | 'menuDotsCircle' | 'link' | 'check';

export interface InstallIconProps {
  className?: string;
  name: InstallIconName;
  size: number;
}

export interface InstallIconPath {
  d: string;
  strokeWidth: number;
}
