import { data } from 'react-router';

// A route matched only by the catch-all pattern is a genuine 404: `data()`
// sets the response status without routing to an ErrorBoundary, so the page
// below still renders normally instead of the generic error fallback.
export const loader = () => data(null, { status: 404 });

export { RouteNotFoundPage as default } from '~/App/components/RouteNotFoundPage/RouteNotFoundPage';
