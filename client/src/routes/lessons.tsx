import type { MetaFunction } from 'react-router';

import { SITE_ORIGIN, SITE_WIDE_META } from '../../consts';
import * as consts from './consts';

// Deliberately the bare path, with no query string. Every filtered view of
// this page (a city, a date, a search term) is the same set of lessons
// narrowed, so each one points here rather than asking to be indexed as a
// page of its own; otherwise one list becomes an unbounded number of URLs
// competing with each other.
const CANONICAL = `${SITE_ORIGIN}/lessons`;

export const meta: MetaFunction = () => [
  { title: consts.lessonsPageTitle() },
  { name: 'description', content: consts.LESSONS_PAGE_DESCRIPTION },
  { tagName: 'link', rel: 'canonical', href: CANONICAL },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: consts.lessonsPageTitle() },
  { property: 'og:description', content: consts.LESSONS_PAGE_DESCRIPTION },
  { property: 'og:url', content: CANONICAL },
  ...SITE_WIDE_META,
];

export { LessonsPage as default } from '~/LessonsPage/LessonsPage';
