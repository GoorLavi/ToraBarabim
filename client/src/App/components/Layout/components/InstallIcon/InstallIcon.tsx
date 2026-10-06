import { INSTALL_ICON_PATHS } from './consts';
import type { InstallIconProps } from './models';

export const InstallIcon = ({ className, name, size }: InstallIconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {INSTALL_ICON_PATHS[name].map(({ d, strokeWidth }) => (
      <path key={d} d={d} strokeWidth={strokeWidth} />
    ))}
  </svg>
);
