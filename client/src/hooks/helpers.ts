import type { AudienceFilter } from '@torabarabim/common';
import { matchPath } from 'react-router-dom';

import { WOMEN_PAGE_PATH } from './consts';

// The one guard for the wire's `AudienceFilter` narrowing (`men` | `mixed`
// only, never `women`: common/src/lesson.ts). Shared by useAudienceFilter
// (the header control) and LessonsPage (the pass-through `?audience=` URL
// param), so `/lessons?audience=women` reads as unfiltered instead of
// forwarding an invalid value to the server.
export const isAudienceFilterValue = (value: string | null | undefined): value is AudienceFilter => value === 'men' || value === 'mixed';

// The one place `/women` (and its sub-route, `/women/rabbaniyot`) is
// matched against a pathname, built on `matchPath` rather than a bare
// string comparison so a trailing slash still matches. Shared by
// useHeaderFilterParams, useAudienceFilter and AudienceFilter, which each
// used to compare the pathname by hand.
export const isWomenPagePath = (pathname: string): boolean => Boolean(matchPath(`${WOMEN_PAGE_PATH}/*`, pathname));
