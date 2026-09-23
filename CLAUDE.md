# ToraBarabim: Project Rules

The rulebook every agent follows. What the product is and who it serves is in
[docs/product.md](docs/product.md). Why past choices were made, and what was rejected,
is in [docs/decisions](docs/decisions/README.md). Design rules and tokens are in
[.claude/design-system.md](.claude/design-system.md). How work moves from idea to
shipped is in [.claude/README.md](.claude/README.md).

Four places, four jobs, and no sentence lives in two of them: **this file** says what to
do, **the decisions folder** says why and what it cost, **the product page** says what
the thing is, **the design system** says what it looks like.

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

## Stay in Your Lane

Every agent owns one domain and decides only inside it. The roster in
[.claude/README.md](.claude/README.md) says who owns what.

- **Comment across, decide within.** You may comment on another agent's domain where it
  bears on yours (product can say a layout buries the outcome; the designer can say a
  label reads like a promise), but you never decide it or tell its owner how to do it.
- **Ask the owner instead of guessing.** A question outside your domain goes to its
  owner: consult them if they are your peer under
  [.claude/consulting-protocol.md](.claude/consulting-protocol.md), otherwise name them
  in your report so the orchestrator routes it.
- **Hand over the context the next owner needs** to decide well, so they do not have to
  rebuild it.
- **A disagreement across domains goes to the human**, stated as a disagreement. Nobody
  settles it by overruling the owner.

## Recording Decisions

A choice that is hard to reverse, costs something real, or will make someone ask "why is
it like this?" gets a file in [docs/decisions](docs/decisions/README.md). Anything
destructive, anything about money, anything about who can do what, and any gap we are
accepting on purpose all qualify. A naming choice, a refactor, or a bug fix does not.

- **Specialist agents never write a decision record.** When your work produces or reveals
  one, name it in your report and let the orchestrator and the human decide. A record
  written by whoever happened to touch the file is a record nobody agreed to.
- **A record is never edited once accepted**, only superseded by a new one. Reversing a
  documented decision is a new record, never a quiet edit to the old.
- **Link, never restate.** A rule that follows from a decision lives here; the record
  links to it. The same sentence in two files will drift, and then one of them is a lie.

## Hebrew and Right-to-Left

This is the defining constraint of the project. It is not a localization feature.

- **Hebrew only.** No language switching, no translation layer, no English fallbacks,
  no translation-key files. The site will never have a second language.
- **Copy is written natively in Hebrew**, never translated from English. If a string
  reads like a translation, it is wrong.
- **A rabbi's name is never shown bare.** Every surface shows it with its honorific,
  "הרב" or "הרבנית", through `rabbiDisplayName`, never a hand-built string. The honorific
  is set once, at creation, and a rabbanit's lessons are for women only, enforced on the
  server wherever a lesson is saved
  ([0026](docs/decisions/0026-rabbaniyot-teach-women-only-and-the-honorific-is-a-field.md)).
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

## Verification

There is a test suite now, in `server/test/`, and CI runs it on every pull request. It
covers the public API and the rendering seam, and it is deliberately a few files with
broad suites rather than a test per function
([0023](docs/decisions/0023-the-public-pages-are-server-rendered.md) reversed
[0008](docs/decisions/0008-no-automated-tests-yet.md), which had accepted the gap).

It does not cover everything, so be precise about what you claim. These are three
different sentences and they are not interchangeable:

- **"It type checks and builds."** The compiler was happy. Nothing was executed.
- **"The suite passes."** Say it only if you ran it. It needs a database and a built
  client, so a sandbox without either cannot make this claim.
- **"It works."** Only for a path someone actually exercised, by a test or by hand.
  Name which.

- **A screenshot is never proof of correctness.** Rendering the UI is design judgment.
  Say "the design is right", never "it works".
- **A change with a design, meaning one meant to change what a person sees, is rendered in Storybook and approved by `tora-designer`
  before it goes to the human or into a pull request.** Every screen the change
  touches, in every state it has, on mocked data. This is a gate, not a courtesy: the
  app needs a database and a root `.env` that a sandbox does not have, so Storybook is
  the only place most agents can see a screen at all, and a design nobody has looked at
  is not ready however clean its build. A `fix` verdict is fixed and rendered again,
  and the loop repeats until the verdict is `approved`.
- **The stories are part of the builder's slice, like the tests.** They are what keeps
  that loop to minutes rather than a project of its own, and a screen with no story is
  a screen that silently skips the gate.
- **A test is written against a defect or a guarantee, never against a coverage
  target.** The suite exists because this project shipped bugs a test would have
  caught; each one earned its assertion.
- **While a change is in progress, run only the tests that exercise what you just changed; run the whole suite once, when every change is in,** before review and before the pull request.
- **Never weaken, skip, or delete an assertion to get a green run.** A failing test is
  a finding to report, not an obstacle.
- If you want to assert something and there is nowhere to assert it, say so in your
  report.
- **A test plan is part of every approved plan**, and the tests it names are part of
  the builder's slice. A slice whose approved test is unwritten is not DONE. A builder
  that finds the plan needs more or different tests stops and asks rather than
  expanding the scope on its own.

## Secrets and Configuration

- Read every secret from the environment. Never put a key, a token, or a connection
  string in a command, a log line, or a committed file.
- `.env` files are ignored by git and stay that way. Commit `.env.example` with the
  variable names and no values.
- Before staging anything, look at what is included. If a file might carry a secret,
  open it, even if the name looks innocent.

## AWS Access

Agents read AWS as their own identity, `claude-readonly`, never as the owner
([0021](docs/decisions/0021-agents-read-aws-as-their-own-identity.md)).

- **The profile is `claude-ro`, and it is already the default.** `.claude/settings.json`
  sets `AWS_PROFILE`, so plain `aws` commands are read only. Do not pass `--profile`.
- **The owner's `torabarabim` profile is off limits.** A hook blocks it, in both the
  `--profile` and the `AWS_PROFILE=` form. Being blocked is the expected outcome, not a
  fault to work around.
- **That hook matches the text of any shell command, deliberately fail closed.** So a
  command that merely quotes the admin profile, a commit message or a PR body naming it,
  is blocked too. That is the intended trade: a false block costs a rewording, while a
  miss would defeat the check. Reword, never loosen the hook.
- **It can see the infrastructure, never the data inside it.** Stacks, services, the
  database configuration, log contents, secret names. Not S3 objects, not secret values,
  not parameter values. Those are denied explicitly and will stay denied.
- **Everything lives in `eu-central-1`**, except the certificate, which must be in
  `us-east-1`.
- A write, a deploy, or anything the read-only user cannot do is handed to the human
  with the exact command. Never worked around.

## Git

- **Only the orchestrator (`/tora`) may stage, commit, or push, and it does not need
  to ask each time.** Specialist agents never stage, commit, or push, no matter what
  their brief says.
- **A commit is not an approval of the work.** It moves the work onto a branch where
  the human can read it; the gates that matter are the pull request and the merge
  below, not the commit.
- Run `git status` and review what is included before staging.
- **`/ship-pr` is the named, per-use exception** that takes a working tree from
  uncommitted to an open pull request in one pass. Invoking it is the explicit request;
  it never runs on the orchestrator's own initiative.
- **Every change reaches `main` through a pull request.** Never commit to `main`
  directly and never merge without being asked. Merging is a deploy
  ([0011](docs/decisions/0011-deploys-are-automatic-migrations-are-not.md)), so the
  merge is always the human's, and the branch is where the work waits until then.

## Data and Migrations

- **Never run a migration on your own.** Change the schema, regenerate types, and hand
  the migration to the human to apply. The exact sequence is the `create-migration`
  skill, and a hook blocks the apply step; being blocked is the expected outcome.
- Migrations are backward-compatible: add before you remove.
- **A removal ships in its own deploy, after the code that stopped needing the old
  shape is already live.** The migration finishes before the new server does, so for
  the length of the deploy the *old* server is running against the *new* schema. On
  2026-09-07 a dropped table took the public site down for the several minutes that
  window lasted. Add the new shape, ship the code that no longer reads the old one,
  and only then, in a later deploy, remove it.

## Project Layout and npm

This is an npm workspaces monorepo. Always run npm commands **from the repo root**
targeting a workspace with `-w <workspace>`. Never `cd` into a package.

```bash
npm run build -w server
npm install zod -w server
```

Workspaces: `server` (Node + TypeScript API) and `client` (React + TypeScript front
end).

## Worktrees

A worktree (a checked-out branch in its own folder, separate from the primary checkout)
starts stale and incomplete, and both failures look like something else.

- **Hydrate it before anything else:** `bash scripts/setup-worktree.sh` from inside the
  worktree. It fast-forwards to `origin/main`, copies the gitignored root `.env` from
  the primary checkout, and installs dependencies. A worktree created three commits
  behind once had no `.github/` and read as "this project has no CI"; a missing `.env`
  reads as a broken CDK setup.
- **Compare against `origin/main`, never the local `main` branch.** The local branch is
  whatever was last checked out there and has been found over a hundred commits stale.
- **A command you hand the human says which folder to run it in.** From the wrong
  checkout it acts on different code and succeeds silently. Migrations are the worst
  case: new migration files exist only in the worktree, so `db:migrate` from the primary
  checkout applies nothing and reports success. Migrations run from the worktree root;
  `cdk` runs from the primary checkout, which has the `.env` the CDK app reads.
- **After a migration, confirm the effect in the database itself**, never from the
  command's output.
- A merged worktree with no uncommitted changes is removed, not kept "just in case".
  Never remove one that is unmerged or dirty without asking.

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
- **Work in the screen's own file, never in drafts.** A small change is made beside
  the original inside that file; a large one gets a page of its own next to the source
  page, and once the human approves it, the source is updated from it and the extra
  page is deleted. Deleting anything needs the human to have approved it first. A
  published library is still off limits. The exact shape is in the protocol below.
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
