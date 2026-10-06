import { DEFAULT_DESCRIPTION, SITE_NAME } from '../consts.ts';
import { argamanVeZahavColors } from '../src/theme/colors/argamanVeZahav.ts';
import { MANIFEST_ICONS, MANIFEST_START_URL } from '../src/pwa/consts.ts';

// theme_color and background_color are the same token on purpose: the Android
// splash is the manifest's background with the icon centred on it, and it has
// to meet the header band, which is color.primary, without a seam.
export const buildManifest = () => ({
  id: '/',
  name: SITE_NAME,
  short_name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  lang: 'he',
  dir: 'rtl',
  start_url: MANIFEST_START_URL,
  scope: '/',
  display: 'standalone',
  theme_color: argamanVeZahavColors.primary,
  background_color: argamanVeZahavColors.primary,
  icons: MANIFEST_ICONS,
});
