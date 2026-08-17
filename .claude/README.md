# ToraBarabim Agent System (Control Panel)

This is the index of how ToraBarabim is built with Claude.

The rulebook is `CLAUDE.md` at the repo root, plus a `CLAUDE.md` in each workspace:
`client/CLAUDE.md` (component tree, styled-components shape, data and state) and
`server/CLAUDE.md` (stack decision, layering, validation and errors). Design rules and
tokens are in [design-system.md](design-system.md). Figma setup and traps are in
[figma-protocol.md](figma-protocol.md).

**Stack:** React 19 + Vite + styled-components 6 + TanStack Query 5 on the front,
Fastify 5 + Zod 4 + Pino on the back, TypeScript strict throughout, npm workspaces.

The roster was adapted from the Why's agent system, cut down to the four roles this
project actually needs.

## Roster (3 specialists + 1 orchestrator)

**Orchestrate (no code):**
- `/tora`: the orchestrator command. Clarifies the idea, writes the plan and the
  work-split, dispatches the specialists, holds the three human gates, and is the only
  one that may commit. Lives in [commands/tora.md](commands/tora.md).

**Design direction (early) and rendered review (late):**
- `tora-designer`: sets the design direction, then renders the real screens in a
  browser and reviews them. Owns Figma.

**Build (write code):**
- `tora-server`: API routes, services, data access. Node + TypeScript.
- `tora-client`: the Hebrew RTL front end. React + TypeScript.

## What each agent reads

A cold-started agent that has to hunt for context burns effort you already spent. So
reading is assigned, not left to judgment: **read your always list, plus the files your
brief names, and nothing else.** Do not scan the repository.

| Document | orchestrator | `tora-server` | `tora-client` | `tora-designer` |
| --- | :---: | :---: | :---: | :---: |
| `CLAUDE.md` (root rulebook) | always | always | always | always |
| `docs/product.md` | always | when the brief touches product behaviour | when the brief touches product behaviour | always |
| `docs/decisions/` | always | the records the brief names | the records the brief names | the records the brief names |
| `server/CLAUDE.md` | when planning server work | always | never | never |
| `client/CLAUDE.md` | when planning client work | never | always | when reviewing a screen |
| `.claude/design-system.md` | when planning a visual change | never | always | always |
| `.claude/figma-protocol.md` | never | never | never | before the first Figma write |
| `.claude/README.md` (this file) | always | never | never | never |

Rules that hold regardless of the table:

- **The brief is the boundary.** The orchestrator names the files an agent owns and the
  files it reads for context. Reading beyond that list is how two agents end up with
  conflicting pictures of the same change.
- **Never assign two agents the same file.** If a slice genuinely needs a file another
  agent owns, that is a blocker to report, not a merge to attempt.
- **A specialist reads a decision record when its brief names one**, because a decision
  usually explains a constraint that would otherwise look arbitrary and get "fixed".
- **Nobody reads the orchestrator's memory.** It is session context for the orchestrator
  alone and is never a substitute for a rule, a decision record, or a brief.

## Idea to shipped (three human gates)

1. **Questions gate (human):** the orchestrator frames the idea and asks what is
   unclear. The human confirms it is the right thing to build.
2. Plan: the orchestrator writes the plan and the work-split. The designer gives
   direction first if the change is visual.
3. **Plan gate (human):** the human approves the plan and the work-split before any
   code is written.
4. Build: `tora-server` lands the API shape, then `tora-client` builds against it.
5. Verify: it compiles and runs; the designer renders and reviews any visual change.
6. **Ship gate (human):** the human ratifies. Only the orchestrator, and only on an
   explicit per-time go-ahead, may then stage, commit, and push. All other agents
   never stage or commit.

Run it with `/tora <your idea>`.

## What was deliberately left out

The Why's system has 23 agents. These were dropped as not worth their weight here yet,
not because they are bad ideas:

- **Testing and QA**: no test agent, no test plan in the plan gate, no browser test
  harness. Verification at step 5 is "it compiles, it runs, the designer looked at it".
  Worth revisiting once there is enough behavior to regress.
- **Code reviewer and guardian**: the verdict-giving agents, and the golden-set evals
  that keep them honest.
- **Product manager, architect, standards keeper, agent architect**: the orchestrator
  absorbs planning and intake for a project this size.
- **Marketing lane** (growth strategist, copywriter, buyer voice) and the **docs
  writer**.
- **Guard hooks**: Why's blocks direct `prisma migrate`, unprofiled AWS calls, and
  production env reads. Nothing here to guard yet; add hooks when there is a
  production to protect.
- **OpenSpec lifecycle** commands.

## Known gaps

- No automated tests, deliberately. See
  [decision 0008](../docs/decisions/0008-no-automated-tests-yet.md) for what "it works"
  is allowed to mean until that changes, and what would reverse it.
- No agent reviews code. The orchestrator verifies by hand that it compiles, runs, and
  behaves; nothing gives a verdict on the code itself.
- Production is decided but not built. See
  [decision 0006](../docs/decisions/0006-production-on-aws-with-cdk.md).
