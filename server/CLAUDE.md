# server house rules (extends root CLAUDE.md)

A TypeScript REST API serving the lesson search. **Fastify 5 + Zod 4 + Pino**, on Node
22 or newer.

## Why this stack

Recorded so nobody re-litigates it, and so it can be overturned on purpose rather than
by drift.

- **Fastify 5** over Express: schema-first validation and serialization, structured
  logging built in, and a plugin model with real encapsulation. Express 5 works, but
  every one of those comes as a separate decision and a separate dependency.
- **Zod 4** for every boundary: one schema gives both the runtime check and the
  TypeScript type, so the type cannot drift from the validation. Use
  `fastify-type-provider-zod` so a route's schema types its own handler.
- **Pino** ships with Fastify and logs structured JSON. It is what makes "an error says
  what was expected, what happened, and which record it concerned" achievable rather
  than aspirational.

Not chosen: Hono (excellent, but its edge-first strengths do not pay off for a Node-
hosted API that will grow a database), and a full framework like NestJS (too much
ceremony for this size).

## Layering

Three layers, and the arrows only point one way: **route → service → data**.

```
src/
  index.ts              builds the app, registers plugins and routes, starts listening
  api/<resource>/
    index.ts            routes: parse, call one service, convert, map errors
  service/<domain>/
    <domain>.ts         business logic and data access
    models.ts           zod schemas and the domain's types
    consts.ts           thresholds, page sizes, limits
    errors.ts           named Error subclasses for this domain's failures
  convertors/           row or record to the shape the client receives
  plugins/              cross-cutting Fastify plugins
```

- **A route never touches the data layer.** It parses input, calls one service,
  converts the result, and maps errors. A query hidden in a route cannot be reused and
  its ad-hoc shape drifts from what the rest of the app expects.
- **A service is a module of exported arrow-function consts**, imported as
  `import * as lessonService from '../../service/lesson/lesson'`. Exception: a service
  wrapping one external system default-exports a singleton object. Pick the wrong shape
  and every call site has to be rewritten later, because the two need different mock
  forms.
- **A service may call a service below it; two services must not call each other.**
  Nothing in the build catches a cycle: the symptom is an `undefined` import at load
  time, thrown far from the change that caused it.
- **A new service earns its own folder only when it owns a distinct entity and its own
  failure vocabulary**; otherwise extend the nearest existing service. Size is not the
  test.
- **A raw database row never leaves the server.** Every response goes through a
  convertor. Returning a raw row leaks internal columns and breaks the client the day a
  column is added or renamed.

## Validation and Errors

This is the part that turns the root HTTP-status rule from "get the number right" into
"impossible to get wrong".

- **Every route declares a Zod schema for its params, query, and body**, defined in the
  service's `models.ts` and attached to the route. A `ZodError` becomes a 400 with the
  flattened issues as `details`. Never hand-parse a query string, and never coerce a
  date or a page number by hand.
- **Domain failures are named `Error` subclasses in `service/<domain>/errors.ts`**, each
  with a comment on when it fires. The route file owns **one** `handleError(res, error)`
  that maps class to status. A service never sees the reply object, and a new failure
  gets a correct status by adding one class. Hand-rolling a try/catch per endpoint is
  how the same condition ends up 500 on one route and 400 on another.
- **An unknown error is a 500 with a logged cause and a generic Hebrew message.** Never
  send an internal message to the client, and never swallow it.
- Root rulebook, HTTP Status Codes, still governs the numbers. An empty search result
  is a `200` with an empty list.

## Search Behavior

The search is the product, so its contract is a house rule, not an implementation
detail.

- **Filters combine as AND, and an absent filter is not a filter.** An empty string, a
  missing parameter, and an empty array all mean "do not narrow by this". They never
  mean "match nothing".
- **Paging is stable and explicit.** Every list response carries the page, the page
  size, and the total. The default and maximum page size live in `consts.ts`, never as
  literals in a handler.
- **Ordering is always specified.** A list with no explicit sort returns rows in
  whatever order the store felt like, which changes under you as data grows.
- **Dates are handled in one place.** Store and compare in UTC; the client renders in
  local time. "Today", "tomorrow", and "this weekend" are resolved against Israel time,
  and that conversion lives in one helper, not at each call site.

## Configuration and Logging

- **Validate configuration with a Zod schema at boot and fail loudly if it is wrong.** A
  missing variable is a startup failure, never a 500 an hour later. Root rulebook,
  Errors.
- **Log with the request logger, not `console`.** Fastify attaches a child logger to
  every request with its id; use it so a line can be traced back to the request that
  produced it.
- **Never log a secret, a token, an authorization header, or a raw request body.**
  Configure Pino's redaction rather than trusting every future call site to remember.

## Data

There is no database yet. Seed data lives behind the service layer, so the routes and
the client never learn where the data came from and swapping in a real store touches
one layer.

When a database arrives:

- **Exactly one client instance**, exported as a singleton with a dev-reload guard. A
  second instance opens a second connection pool and nothing warns you: it surfaces
  later as pool exhaustion under load.
- **A write spanning more than one row that must not half-apply runs in a transaction.**
  Without it a mid-sequence failure leaves orphaned rows with nothing marking them
  broken.
- Migrations go to the human to apply. Root rulebook, Data and Migrations.

## Notes

- All types crossing the wire are defined once and shared with the client, never
  redefined on both sides.
- The TypeScript compiler is currently the only automated guard on server code. It is
  fully strict and it stays that way. See **Verification** in the root rulebook for
  what "it works" is allowed to mean.
