export interface MockRequestContext {
  request: Request;
  params: Record<string, string>;
}

export type MockResolver = (context: MockRequestContext) => Response | Promise<Response>;

export interface MockRoute {
  method: string;
  path: string;
  resolver: MockResolver;
}

export interface ApiMocksParameter {
  handlers?: Record<string, MockRoute>;
}

const route =
  (method: string) =>
  (path: string, resolver: MockResolver): MockRoute => ({ method, path, resolver });

export const http = {
  get: route('GET'),
  post: route('POST'),
};

export const respondWithJson = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const jsonResolver =
  (body: unknown): MockResolver =>
  () =>
    respondWithJson(body);

// The API's error body shape: `{ error, message }`.
export const errorResolver =
  (status = 500, error = 'internal_error', message = 'שגיאה'): MockResolver =>
  () =>
    respondWithJson({ error, message }, status);

// A request that never settles, for a story that shows a loading state.
export const loadingResolver: MockResolver = () => new Promise<Response>(() => {});

export const queryOf = (request: Request): URLSearchParams => new URL(request.url).searchParams;

// Segments are compared and captured decoded, here and nowhere else: a URL's
// pathname is always percent-encoded, so a Hebrew slug would never equal its
// own literal otherwise. A route must match the whole path, segment for
// segment, so `/v1/rabbis` and `/v1/rabbis/:id` never both claim one request.
const matchPath = (pattern: string, pathname: string): Record<string, string> | null => {
  const patternSegments = pattern.split('/');
  const pathSegments = pathname.split('/').map(decodeURIComponent);
  if (patternSegments.length !== pathSegments.length) return null;

  const params: Record<string, string> = {};
  for (const [index, patternSegment] of patternSegments.entries()) {
    const pathSegment = pathSegments[index];
    if (pathSegment === undefined) return null;
    if (patternSegment.startsWith(':')) params[patternSegment.slice(1)] = pathSegment;
    else if (patternSegment !== pathSegment) return null;
  }
  return params;
};

// React Query cancels an in-flight attempt by aborting its signal, including
// its own retries, and tells a cancelled attempt from a real failure by
// whether the fetch rejected. A resolver that ignores the signal answers a
// cancelled attempt as if it had succeeded, which the query keeps as a stale
// result instead of moving on: an error-state story can sit in `loading`
// forever instead of ever reaching its error state.
const settleOnAbort = (signal: AbortSignal, response: Promise<Response>): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    response.then(resolve, reject);
  });

// Fails open: a request no route claims goes to the real `fetch`, so a story
// that forgets a route sees a plain 404 from the dev server rather than a
// hang. Routes are tried in declaration order, meta defaults before a story's
// own keys, and the first match answers.
export const installApiMocks = (parameter: ApiMocksParameter | undefined): (() => void) | undefined => {
  const routes = Object.values(parameter?.handlers ?? {}).filter((route): route is MockRoute => Boolean(route));
  if (routes.length === 0) return undefined;

  const realFetch = window.fetch;
  window.fetch = async (input, init) => {
    const request = input instanceof Request ? new Request(input, init) : new Request(new URL(String(input), window.location.origin), init);
    const { pathname } = new URL(request.url);

    for (const { method, path, resolver } of routes) {
      if (method !== request.method) continue;
      const params = matchPath(path, pathname);
      if (params) return settleOnAbort(request.signal, Promise.resolve(resolver({ request, params })));
    }
    return realFetch(input, init);
  };

  return () => {
    window.fetch = realFetch;
  };
};
