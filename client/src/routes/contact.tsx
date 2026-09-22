import type { MetaFunction } from 'react-router';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { DEFAULT_OG_IMAGE_META, SITE_WIDE_META_BASE } from './meta';

const CANONICAL = `${SITE_ORIGIN}/contact`;

export const meta: MetaFunction = () => [
  { title: consts.contactPageTitle() },
  { name: 'description', content: consts.CONTACT_PAGE_DESCRIPTION },
  { tagName: 'link', rel: 'canonical', href: CANONICAL },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: consts.contactPageTitle() },
  { property: 'og:description', content: consts.CONTACT_PAGE_DESCRIPTION },
  { property: 'og:url', content: CANONICAL },
  ...SITE_WIDE_META_BASE,
  ...DEFAULT_OG_IMAGE_META,
];

export { ContactPage as default } from '~/ContactPage/ContactPage';
