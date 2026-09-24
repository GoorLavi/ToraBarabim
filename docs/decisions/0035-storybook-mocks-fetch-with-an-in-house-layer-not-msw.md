# 0035: Storybook mocks `fetch` with an in-house layer, not msw

- **Status:** accepted
- **Date:** 2026-09-22
- **Decided by:** project owner

## Context

Making Storybook the designer's required review surface ([tora.md](../../.claude/commands/tora.md),
[CLAUDE.md](../../CLAUDE.md) Verification) meant every story needed a real network layer:
loading, empty, error, and populated states for pages that fetch. msw is the industry
default for this and was tried first: `msw` plus `msw-storybook-addon`, wired through
Storybook's `staticDirs`.

msw works by registering a Service Worker script in the browser. That registration
fails in the in-app browser the designer reviews in (`navigator.serviceWorker.register`
rejects there with "an unknown error occurred when fetching the script", on every
variant tried: with or without an explicit scope, as a classic or module worker, over
`localhost` and `127.0.0.1`). It registers without issue in an ordinary Chrome tab. The
review is specified to happen in that in-app browser, so every story would have shown
msw's own error screen instead of the page being reviewed, from the first PR onward.

## Decision

Storybook mocks `fetch` with a small, dependency-free module the project owns
(`client/.storybook/apiMocks.ts`): a per-story interceptor installed and restored by
`beforeEach` in `client/.storybook/preview.tsx`, keyed handlers under
`parameters.apiMocks.handlers`, and `http.get`/`http.post` route builders with
`:slug`-style path matching. No Service Worker, so nothing needs registering.

## Consequences

- **No msw dependency, no generated `mockServiceWorker.js` committed to the repo.** The
  mock layer is ordinary TypeScript the team already reads and can extend without
  learning msw's handler API.
- **The mock layer must itself track two React Query mechanisms `fetch` alone doesn't
  cover:** it forwards `AbortSignal` so a superseded retry rejects instead of resolving
  stale, and Storybook's preview pins React Query's `focusManager` focused with
  `networkMode: 'always'`, because a retry is otherwise paused while the tab is not the
  frontmost one, which a review running in a background tab hits directly. Both are
  documented at their site in `client/.storybook/apiMocks.ts` and `preview.tsx`.
- **If the review browser changes** (for example, review moves to an ordinary Chrome tab
  instead of the in-app one), msw becomes viable again and this decision should be
  revisited rather than assumed to still hold.
- **Method coverage is `GET` and `POST` only**, matching every story written so far. A
  story that needs `PUT`/`PATCH`/`DELETE` adds it to `client/.storybook/apiMocks.ts`'s
  `http` object when it has a real caller, not before.

## Rejected

- **msw + msw-storybook-addon:** the standard choice, rejected only because its Service
  Worker cannot register in the browser the designer actually reviews in. Not a verdict
  on msw's design.
- **Reviewing in an ordinary Chrome tab instead of the in-app browser:** the review
  environment was already decided as part of making Storybook the required gate; changing
  it to fit a tool was the wrong side to move.
- **Leaving Storybook without a mock layer:** every fetching page would default to
  Storybook's own dev server, which has no API behind it, so every state but a
  network-error would be unreachable.
