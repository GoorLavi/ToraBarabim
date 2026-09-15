# ToraBarabim Agent System (Control Panel)

This is the index of how ToraBarabim is built with Claude.

The rulebook is `CLAUDE.md` at the repo root, plus a `CLAUDE.md` in each workspace:
`client/CLAUDE.md` (component tree, styled-components shape, data and state) and
`server/CLAUDE.md` (stack decision, layering, validation and errors). Design rules and
tokens are in [design-system.md](design-system.md). Figma setup and traps are in
[figma-protocol.md](figma-protocol.md). The consulting limits for the leads are in
[consulting-protocol.md](consulting-protocol.md).

**Stack:** React 19 + Vite + styled-components 6 + TanStack Query 5 + React Router 7
framework mode on the front, Fastify 5 + Zod 4 + Drizzle + Pino on the back, TypeScript
strict throughout, npm workspaces.

The roster was adapted from the Why's agent system, cut down to the roles this project
actually needs, and re-aligned with it in September 2026 once it had grown the rules
that came out of measured pain there.

## Roster (8 specialists + 1 orchestrator)

**Orchestrate (no code):**
- `/tora`: the orchestrator command. Clarifies the idea, holds the three human gates,
  dispatches the specialists, checks the assembled result, and is the only one that
  may commit. Lives in [commands/tora.md](commands/tora.md).

**Advise and plan (no code):**
- `tora-product`: frames the problem for the seeker and the lister, names the success
  signal, and leads discovery in the team flow. Lead: consults `tora-designer` and
  `tora-hebrew-editor`.
- `tora-architect`: turns the clarified idea into the plan, the area ownership table,
  and the test plan. Lead: consults `tora-server` and `tora-ssr`.

**Design direction (early) and rendered review (late):**
- `tora-designer`: sets the direction, then renders the real screens in a browser and
  reviews them. Owns Figma. Lead: consults `tora-hebrew-editor`, `tora-ssr`, and closes
  with `tora-product`.

**Build (write code):**
- `tora-server`: API routes, services, data access. Node + TypeScript.
- `tora-client`: the Hebrew RTL front end. React + TypeScript.
- `tora-ssr`: the rendering seam. The root document, the entry files, loaders and `meta`,
  the Fastify mount, and the build that carries both bundles. It straddles both
  workspaces, which is exactly why it is separate: page components stay with
  `tora-client` and business logic stays with `tora-server`.

**Verify and review (report only, a builder fixes):**
- `tora-reviewer`: house-rule compliance and correctness, PASS or FIX. Its golden set
  in [evals/](evals/README.md) is re-run before any edit to its file.
- `tora-hebrew-editor`: reads every Hebrew line as a native speaker and proposes line
  edits; never writes copy, never changes meaning. Its own instructions are in Hebrew
  on purpose.

## What each agent reads

A cold-started agent that has to hunt for context burns effort you already spent. So
reading is assigned, not left to judgment: **read your always list, plus the files your
brief names, and nothing else.** Do not scan the repository.

| Document | orchestrator | `tora-product` | `tora-architect` | `tora-server` | `tora-client` | `tora-ssr` | `tora-designer` | `tora-reviewer` | `tora-hebrew-editor` |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `CLAUDE.md` (root rulebook) | always | always | always | always | always | always | always | always | always |
| `docs/product.md` | always | always | when the brief touches product behaviour | when the brief touches product behaviour | when the brief touches product behaviour | when the brief touches product behaviour | always | never | always |
| `docs/decisions/` | always | the records the brief names | the records the brief names | the records the brief names | the records the brief names | the records the brief names | the records the brief names | the records the brief names | never |
| `server/CLAUDE.md` | when planning server work | never | when the change touches the server | always | never | always | never | when the diff touches the server | never |
| `client/CLAUDE.md` | when planning client work | never | when the change touches the client | never | always | always | when reviewing a screen | when the diff touches the client | never |
| `.claude/design-system.md` | when planning a visual change | never | never | never | always | never | always | never | never |
| `.claude/consulting-protocol.md` | never | before the first consult | before the first consult | never | never | never | before the first consult | never | never |
| `.claude/figma-protocol.md` | never | never | never | never | never | never | before the first Figma write | never | never |
| `.claude/README.md` (this file) | always | never | never | never | never | never | never | never | never |

`tora-ssr` reads both workspace rulebooks because it is the one agent whose slice spans
them. That breadth is also why its boundaries are drawn tightly in its own file: it owns
how a page becomes HTML, never what the page says or what the data means.

Rules that hold regardless of the table:

- **The brief is the boundary.** The orchestrator names the areas an agent owns and the
  files it reads for context. Reading beyond that list is how two agents end up with
  conflicting pictures of the same change.
- **Areas, not files.** The plan's ownership table assigns path prefixes, one agent per
  prefix, none overlapping. A prefix owns the files a builder creates while working.
- **A specialist reads a decision record when its brief names one**, because a decision
  usually explains a constraint that would otherwise look arbitrary and get "fixed".
- **Nobody reads the orchestrator's memory.** It is session context for the orchestrator
  alone and is never a substitute for a rule, a decision record, or a brief.

## Consulting and depth

Three leads (`tora-product`, `tora-architect`, `tora-designer`) can consult peers
before they report. The limits are in [consulting-protocol.md](consulting-protocol.md):
fixed peers named in the lead's own file, two rounds at most, three peers per round, one
question per peer, peers advise and never build, a peer's call in its own domain stands,
and a disagreement goes to the human.

`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` is 2 in `settings.json`. It counts subagent
layers below the main session, so a lead (layer 1) can consult and its peer (layer 2)
cannot delegate further. Setting it to 1 turns nesting off, and the leads could not
consult anyone. The **Stay in Your Lane** rule in the root `CLAUDE.md` is what the
protocol enforces at a consult: comment across, decide within.

## Idea to shipped (three human gates)

Two flows, named in the first status line. **Team flow** for an idea that needs product
decisions before anyone can say what to build; **standard flow** for everything else.

Team flow: discovery led by `tora-product` (output: a spec), design led by
`tora-designer` (output: direction and a Figma frame), a **gate** where the human
approves both, then the standard flow from its plan step. Once the spec is approved the
data model and API may be planned in parallel with design; only the UI build waits.

Standard flow:

1. **Questions gate (human):** `tora-product` frames the idea unless it is small and
   clear; the orchestrator asks what is unclear. The human confirms it is the right
   thing to build.
2. Plan: `tora-architect` writes the plan with the area ownership table and the test
   plan; the builders read it once before it is locked; the designer gives direction
   first if the change is visual.
3. **Plan gate (human):** the human approves the plan, the work-split, and the test
   plan before any code is written. New screens get their design approved before any
   front-end code.
4. Build: `tora-server` lands the API shape, then `tora-ssr` and `tora-client` build
   against it. The orchestrator checks the ownership table for overlap before any
   dispatch.
5. Verify: the orchestrator runs it first and puts what it saw into the briefs;
   `tora-reviewer` reviews every code change and the tests; `tora-designer` renders
   and reviews any visual change; `tora-hebrew-editor` reads every Hebrew string. The
   orchestrator checks the assembled result when more than one builder touched it.
6. **Ship gate (human):** the human ratifies the merge, which is the deploy. The
   orchestrator stages, commits, and pushes on the human's explicit go-ahead, or via
   `/ship-pr`; all other agents never stage or commit. The commit is not the gate, the
   merge is.

Run it with `/tora <your idea>`.

## Guard hooks (what each blocks)

All three are `PreToolUse` hooks on Bash in `settings.json`, matching the text of the
command, deliberately fail closed: a command that merely quotes a blocked word is
blocked too, and the cost of that is a rewording.

- The AWS profile hook blocks the owner's `torabarabim` profile in both the `--profile`
  and the `AWS_PROFILE=` form. `claude-ro` is the default and needs no flag.
- `hooks/guard-migrate.sh` blocks `db:migrate`, `drizzle-kit migrate`, and
  `drizzle-kit push`. The agent generates; the human applies (`create-migration`).
- `hooks/guard-production-db.sh` blocks `db:tunnel`, the tunnel script, and
  `ssm start-session`. Agents work against the local database only.

A `permissions.deny` list in `settings.json` carries the same commands as a second
layer.

## Skills

- `create-migration`: the safe Drizzle sequence, and the hand-off that names the folder.
- `ship-pr`: stage, commit, push, and open the pull request in one pass, on the human's
  explicit invocation. Orchestrator only.
- Figma writes go through the `figma-use` and `figma-create-new-file` plugin skills; the
  loading rules and the server id live in `figma-protocol.md`.

## Evals

`evals/reviewer/` holds three golden cases, each a bug this project actually shipped:
a bare rabbi name, physical CSS direction, and a 404 on an empty search. The set is
re-run before any edit to `agents/tora-reviewer.md`, and the result is presented with
the edit. A new class of miss in real work earns a new case.

## Worktrees

`scripts/setup-worktree.sh` hydrates a fresh worktree: fast-forwards to `origin/main`,
copies the root `.env` from the primary checkout, installs dependencies. The rule and
the reasons are under **Worktrees** in the root `CLAUDE.md`.

## What was deliberately left out

The Why's system has 25 agents. These were dropped as not worth their weight here yet,
not because they are bad ideas:

- **QA as its own agent.** The test plan is approved at the plan gate and the builders
  write the tests as part of their slice. A separate QA lane earns its place when the
  suite is large enough that growing it is a job of its own.
- **A guardian.** The orchestrator checks the plan before building and the assembled
  result after. With three builders that is still one person's job.
- **Standards keeper and agent architect.** The retro step and the human do this; the
  golden set is what keeps the one verdict-giving agent honest.
- **Marketing lane** (growth strategist, copywriter, buyer voice, landing benchmark)
  and the **docs writer**. There is one product page and a decisions folder, and the
  orchestrator keeps them current.
- **Cloud-session setup**, **OpenSpec**, **move-to-main**, and a **format-on-edit hook**
  (there is no Prettier here to run).

## Known gaps

- The reviewer reads code; nobody runs the suite for it in a sandbox without a
  database. "The suite passes" is claimed only by whoever ran it, per **Verification**
  in the root rulebook.
- The designer renders the public pages and the panels through `launch.json`; there is
  no Storybook sweep or browser harness. Rendering errors are found by looking.
