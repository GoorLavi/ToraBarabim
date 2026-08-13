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

- `.claude/launch.json` does not exist yet, so the designer cannot start the app on its
  own. Add it when the client is scaffolded.
- The design system's color, type, spacing, and breakpoint tokens are still open. They
  are the next thing to settle.
- The Figma project is recorded in [figma-protocol.md](figma-protocol.md), but the
  Figma server may still need authorizing before any tool works.
- No automated tests, deliberately. See **Verification** in `CLAUDE.md` for what "it
  works" is allowed to mean until that changes.
