import type { MetaFunction } from 'react-router';

export { PlacePanel as default } from '~/PlacePanel/PlacePanel';

// A logged-in panel, never a public search result (decision 0023).
// robots.txt disallows it separately; the two do different jobs (a crawler
// that already has this URL from elsewhere still reads this tag), so both
// are kept even though either alone would mostly cover the other.
export const meta: MetaFunction = () => [{ name: 'robots', content: 'noindex, nofollow' }];
