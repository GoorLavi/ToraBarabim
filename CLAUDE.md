# ToraBarabim: Project Rules

The rulebook every agent follows. Design rules and tokens are in
[.claude/design-system.md](.claude/design-system.md). How work moves from idea to
shipped is in [.claude/README.md](.claude/README.md).

This project is young. The rules here are the ones that pay for themselves on day one;
they will grow, but only when a real correction earns a new line.

## What this is

A Hebrew website for finding Torah lessons: search by rabbi, by place, by date, or by
what is on near you tonight. Modelled on the way a listings site like comy.co.il works
for stand-up shows.

## Escalate Before Bending a Rule

A compromise that ships without being flagged is worse than one that never shipped,
because the next person reads it as the intended pattern and copies it.

- **Notice, then stop.** If the clean path is blocked and you are about to break a
  house rule, special-case something, weaken a check, cast a type away, duplicate code
  you know is shared, or leave a known-wrong behavior in place, stop before you write
  it.
- **Come back with options, not a decision.** Present the real choices: the clean fix
  and what it costs, the contained workaround and what it leaves behind, and doing
  nothing. Say which you would pick and why, then let the human choose.
- **Say so when it ships.** If a workaround is approved, name it in your report and in
  a comment at the site, with what would make it unnecessary. The silence is the
  failure, not the compromise.
- This binds every agent. Being blocked is a normal outcome to report, never a reason
  to improvise.

## Hebrew and Right-to-Left

This is the defining constraint of the project. It is not a localization feature.

- **Hebrew only.** No language switching, no translation layer, no English fallbacks,
  no translation-key files. The site will never have a second language.
- **Copy is written natively in Hebrew**, never translated from English. If a string
  reads like a translation, it is wrong.
- **The page renders `direction: rtl`.** Use CSS logical properties in all layout, so
  the direction lives in one place instead of being re-decided per rule.
  ```css
  /* Good */ .row { text-align: start; padding-inline: 16px; border-inline-start: 1px solid var(--border); }
  /* Bad  */ .row { text-align: left;  padding-left: 16px;  border-left: 1px solid #e0e0e0; }
  ```
- Dates, times, and numbers are formatted the way an Israeli reader expects.
- **Code, comments, file names, and commit messages are English.** Only what the user
  reads is Hebrew.

## Mobile First

Most people will find this site on a phone, often while out and deciding where to go
tonight. Every screen is designed and built narrow first, then allowed to grow.

- Start at the phone width and add breakpoints upward. Never design desktop and shrink.
- Tap targets are thumb-sized, not mouse-sized.
- **Layouts must survive real data:** a long rabbi name, a long place name, a missing
  photo, a lesson with almost nothing filled in. A layout that only fits the sample
  data is a defect, not a detail.
- **Every screen that loads data has three real states:** loading, empty, error. The
  empty state matters most here: someone searched for a lesson near them and found
  none, and the screen has to help rather than dead-end.
- The bar is a polished, high-end feel achieved with restraint: generous type, calm
  color, real spacing. Not heavy animation, not decoration.

## Scope and Boundaries

- **No abstraction before the second real caller.** Do not generalize on speculation. A
  helper with one caller is a function in that file, not a shared module.
- **Lift to the nearest common ancestor, not to the top.** When a second place needs
  something, move it up the folder tree only as far as both consumers require, not
  straight to a shared folder.
- **A threshold lives in one place and everyone else reads it.** A page size, a radius,
  a time window, a limit: defined once and imported, never retyped. The same number
  appearing in two files is the warning sign.
- **Replacing means deleting.** When you supersede something, remove the old thing in
  the same change. Git remembers it; the next reader cannot tell it is dead.
- **When you add a fallback, decide fail-open or fail-closed deliberately** and write
  which and why next to it.

## Code Quality

Review-blocking, not preferences.

- **Matching the surrounding code is the default, not an excuse.** Follow the nearest
  existing pattern, but when the neighbor is genuinely wrong, do not copy it forward:
  write it correctly and say so in your report. "The file already does it that way" is
  how a codebase's worst habit quietly becomes its standard.

**Naming**
- A name says what the thing is or does, not how it works or when it arrived. `data`,
  `info`, `temp`, `handleClick2`, and a `utils.ts` that collects anything unrelated are
  all signs the thing was labelled rather than named.
- Booleans read as assertions (`isLoading`, `hasResults`, `shouldRetry`). A function
  name says what it returns or what it changes.
- The name must match everything the code does. A `getLesson` that also writes a log
  row will burn the first person who trusts the name.

**Shape**
- Guard clauses over nesting: handle the edge case and return, so the main path stays
  at one level of indentation.
- A function that needs comments to separate its sections is several functions.
- Keep effects at the edges and the logic in the middle pure. Filtering, sorting, and
  date maths should not need a network call to be exercised.

**Types**
- Make illegal states unrepresentable. A discriminated union beats a bag of optional
  fields plus a boolean flag, because the compiler then rejects the combinations that
  should never exist.

**Comments**
- **Write no comment by default.** Code that needs prose to be understood is usually
  code that needs rewriting: a clearer name, a smaller function, an extracted step.
  Reach for that first. A running commentary on what the code does is noise, it goes
  stale silently, and it trains the next reader to skim.
- **The exception is genuine complexity**, where a reader who is competent and attentive
  would still be stuck: a non-obvious algorithm, an ordering that looks arbitrary but is
  not, a workaround for someone else's bug. Then write one comment that says the thing
  the code cannot: the constraint, the rejected alternative, or the consequence that is
  not visible locally. Never what the next line does.
- **A few places require a comment** and are not subject to the default above: an
  approved workaround at its site, a fail-open or fail-closed choice next to the
  dependency it governs, a `createGlobalStyle` block naming what put that DOM out of
  reach, and a hand-mirrored constant naming its source. Each is a decision that leaves
  no other trace in the code.
- **A comment that restates a house rule is noise.** The rule already lives in this
  rulebook, where it is read once and applies everywhere. Writing "the only place that
  converts a row" above the convertor, or "never log a secret" above the redaction
  config, adds a line that has to be maintained and teaches the reader nothing they
  would not get from the rulebook. Comment the thing that is true *here* and nowhere
  else.
- Delete dead and commented-out code rather than leaving it behind.
- A `TODO` names the condition that would resolve it. Without one it is a wish.

**Async and data access**
- Independent async calls run together with `Promise.all`. Awaiting them in sequence
  turns three 200ms calls into 600ms for nothing.
- Never query inside a loop over rows. Fetch the set once and join in memory, or the
  cost grows with the data while local testing stays fast.

**Error messages**
- An error says what was expected, what happened, and which record it concerned.
  "Invalid input" costs someone an hour that "expected a date, got 'tomorrow'" would
  have saved.

## Engineering Baseline

**TypeScript**
- `strict` is on everywhere and stays on. Never widen a type to silence an error: no
  `any` without a one-line comment saying why, and no non-null `!` on a value that can
  genuinely be null. Narrow with a check instead.
- A type describes what the code actually returns. A wrong type is worse than no type,
  because everything downstream trusts it.

**Errors**
- Never swallow an error. Every `catch` handles it, rethrows it, or logs it with enough
  context to identify the request. An empty catch is never acceptable.
- Fail at boot, not at first use. Validate required configuration when the process
  starts, so a missing variable is a startup failure rather than a 500 an hour later.
- Every user-facing surface has something that contains a crash: an error boundary in
  React, error-handling middleware on the server.

**React**
- Every effect that subscribes, times, or fetches cleans up after itself.
- Derive, do not duplicate. State that can be computed from existing state or props is
  computed, not stored and kept in sync by hand.
- List keys are stable ids from the data, never the array index, or React reuses the
  wrong DOM node when the list reorders.

**Node and the API**
- Every async handler's rejection path reaches an error handler.
- Validate and narrow every request body, query parameter, and route parameter before
  it reaches a query. Never trust a date, a page size, or an id off the wire.
- An empty search result is a normal `200` with an empty list, never a `404`.
- Never log a secret, a token, an authorization header, or a raw request body.

## HTTP Status Codes

Every error response carries an accurate status code, not just a JSON error body.

- **4xx** for client errors: validation 400, auth 401 or 403, not found 404, rate limit
  429 (also set `Retry-After`).
- **5xx** for server or upstream errors.

## Verification (and the gap we are accepting)

**There are no automated tests yet.** That is a deliberate, temporary choice to move
fast at the start, and it has a cost: nothing catches a regression.

So be precise about what you claim:

- "It works" currently means: it type-checks, it starts, and someone exercised the path
  by hand. Say exactly that, not more.
- **A screenshot is never proof of correctness.** Rendering the UI is design judgment.
  Say "the design is right", never "it works".
- If you find yourself wanting to assert something and there is nowhere to assert it,
  say so in your report. That is the signal that this section needs to change.

Revisit this once there is enough behavior worth protecting.

## Secrets and Configuration

- Read every secret from the environment. Never put a key, a token, or a connection
  string in a command, a log line, or a committed file.
- `.env` files are ignored by git and stay that way. Commit `.env.example` with the
  variable names and no values.
- Before staging anything, look at what is included. If a file might carry a secret,
  open it, even if the name looks innocent.

## Git

- **Never stage or commit on your own.** Do not run `git add`, `git commit`, or
  `git push` unless the human explicitly asks, each time.
- Only the orchestrator (`/tora`) may commit, and only on an explicit per-time
  go-ahead. Specialist agents never stage or commit.
- Run `git status` and review what is included before staging.

## Data and Migrations

There is no database yet. When one arrives:

- **Never run a migration on your own.** Change the schema, regenerate types, and hand
  the migration to the human to apply.
- Migrations are backward-compatible: add before you remove.

## Project Layout and npm

This is an npm workspaces monorepo. Always run npm commands **from the repo root**
targeting a workspace with `-w <workspace>`. Never `cd` into a package.

```bash
npm run build -w server
npm install zod -w server
```

Workspaces: `server` (Node + TypeScript API) and `client` (React + TypeScript front
end).

## Styling (styled-components)

Styles are written with styled-components in a colocated `styles.ts`. Never inline
`style` props for layout.

- Always use the `>` direct child combinator when targeting a direct child element.
- Always use deep nesting; never write flat or repeated selectors. Nest pseudo-states
  with `&` inside their parent block.
- **Never target bare HTML elements** (`h2`, `p`, `ul`, `li`). Assign a class name and
  target that instead. The one exception is a single top-level reset.
- Use the tokens in [.claude/design-system.md](.claude/design-system.md) for color,
  type, spacing, radii, and breakpoints. Do not invent raw values. A raw hex in a
  component is a bug.
- Use the `classnames` package (imported as `classNames`) for conditional class
  strings, never template literals or manual concatenation.
  ```tsx
  /* Good */ <div className={classNames('card', { open: isOpen })} />
  /* Bad  */ <div className={`card${isOpen ? ' open' : ''}`} />
  ```

The exact file shape (the `css` block, the `styled()` wrapper, the namespace import)
is in [client/CLAUDE.md](client/CLAUDE.md).

## TypeScript Conventions

- Types, interfaces, and enums go in a `models.ts` colocated with the component or
  module, not inline in the implementation file.
- Constants go in a colocated `consts.ts`, not inline.
- Pass React props with the `{...{ }}` spread rather than listing each attribute. `key`
  is always written outside the spread.
  ```tsx
  /* Good */ <LessonCard key={lesson.id} {...{ lesson, onSelect }} />
  /* Bad  */ <LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect} />
  ```

## Visual Review

To judge a design, look at the rendered UI, not the code. Start the app and open it in
the browser, at the mobile width first, then desktop. Check every state, not just the
happy path.

A rendered image answers "does this look right", never "does this work".

## Figma

Figma is where new design happens; code is the source of truth for what ships.

- **The project:** `1600490864286182601` / project `639157253`
  ([open](https://www.figma.com/files/team/1600490864286182601/project/639157253)).
  The plan key for creating files is `team::1600490864286182601`.
- **Code is canonical for design tokens.** Shipped values live in code and are mirrored
  in `.claude/design-system.md`. Figma mirrors code, not the other way around.
- **Figma is upstream for new design.** A redesign starts in Figma, gets approved, is
  implemented in code, and then the tokens and the design system update to match.
- **Never write to a shared or canonical file.** Work in a drafts file you created, or
  a duplicate the human handed you. If you cannot tell which a file is, stop and ask.
- `tora-designer` owns Figma. The setup steps and the API traps are in
  [.claude/figma-protocol.md](.claude/figma-protocol.md): read it before the first
  write.

## Planning

1. Big picture: current state and what needs to change.
2. Impact analysis: every part affected.
3. List all files that will be touched.
4. Dependency-ordered steps: data shape → API → UI.
5. Identify parallel versus sequential work.
6. Scope check: say what this is *not*.
7. Validation and edge cases.

Surface uncertainties after presenting the plan and ask before proceeding. Do not start
coding until the plan is confirmed. Look at existing patterns before building something
new. Re-read the plan after each step to prevent drift.

## Language and Punctuation

- All code comments and documentation in English.
- Never use the em-dash character in anything you produce: copy, docs, comments, commit
  messages, reports, or chat. Use a comma, a period, or a colon instead.
