import type { MetaFunction } from 'react-router';
import { data } from 'react-router';

import * as notFoundConsts from '~/App/components/RouteNotFoundPage/consts';

// A route matched only by the catch-all pattern is a genuine 404: `data()`
// sets the response status without routing to an ErrorBoundary, so the page
// below still renders normally instead of the generic error fallback.
export const loader = () => data(null, { status: 404 });

// Deliberately no canonical and no Open Graph: this screen is not a page,
// and root.tsx's defaults describe the home page, so inheriting them would
// have every dead link claim to be it. `noindex` tells a crawler what the
// 404 above tells a client, which matters because a link to a removed
// lesson can be shared and followed long after the lesson is gone.
export const meta: MetaFunction = () => [
  { title: notFoundConsts.ROUTE_NOT_FOUND_HEADING },
  { name: 'robots', content: 'noindex' },
];

export { RouteNotFoundPage as default } from '~/App/components/RouteNotFoundPage/RouteNotFoundPage';
