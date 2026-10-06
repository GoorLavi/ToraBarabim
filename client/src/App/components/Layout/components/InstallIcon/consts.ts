import type { InstallIconName, InstallIconPath } from './models';

const LINE = 1.8;
// A zero-length stroke with round caps draws a dot; the width is the dot's diameter.
const DOT = 3;

export const INSTALL_ICON_PATHS: Record<InstallIconName, readonly InstallIconPath[]> = {
  share: [{ d: 'M12 15V4M8 7.5L12 4l4 3.5M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1', strokeWidth: LINE }],
  addToHomeScreen: [{ d: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8v8M8 12h8', strokeWidth: LINE }],
  menuDots: [{ d: 'M12 5h.01M12 12h.01M12 19h.01', strokeWidth: DOT }],
  menuDotsCircle: [
    { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', strokeWidth: LINE },
    { d: 'M8 12h.01M12 12h.01M16 12h.01', strokeWidth: 2.4 },
  ],
  link: [{ d: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1', strokeWidth: LINE }],
  check: [{ d: 'M5 12.5l4.5 4.5L19 7.5', strokeWidth: 2.2 }],
};
