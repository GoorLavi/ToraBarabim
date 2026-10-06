// Explicit extension: pwa-source/rasterise.ts imports this file under plain
// Node, which does not resolve extensionless specifiers.
import { SPLASH_DIRECTORY } from './consts.ts';
import type { SplashScreen } from './models';

export const splashImageSize = ({ width, height, pixelRatio }: SplashScreen): { width: number; height: number } => ({
  width: width * pixelRatio,
  height: height * pixelRatio,
});

export const splashImagePath = (screen: SplashScreen): string => {
  const { width, height } = splashImageSize(screen);
  return `${SPLASH_DIRECTORY}/${width}x${height}.png`;
};

export const splashMediaQuery = ({ width, height, pixelRatio }: SplashScreen): string =>
  `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${pixelRatio}) and (orientation: portrait)`;
