# Figma operating protocol

Read this before your first Figma write. It carries the setup step that is easy to
skip and the API rules that silently break scripts.

## Step zero: prove the grant is live

Call `whoami` before anything else. It is free, read-only, and fails loudly. If it
answers, your Figma grant is real. If it does not, **stop and report**: do not plan
around it.

The Figma server may also need the human to authorize it before any tool works. If
`whoami` fails on authorization, say so plainly: the human authorizes it from their
claude.ai connector settings or with `claude mcp` in an interactive terminal. You
cannot do it for them, and you must not ask them for a token or a callback URL.

**A session-start warning that `plugin:figma:figma` needs authorization is expected
and means nothing is wrong.** The Figma skill pack ships its own definition of the
same server, and that second copy was never authorized because nothing uses it. The
authorized connector is a different entry and works. `whoami` is what settles it, so
never conclude from that warning that Figma is disconnected: one session reported
exactly that to the human and it was false. Do not remove the skill pack to silence
it either; it is what provides the skills the section below requires.

## Load the skill first, always

- Before the first `use_figma` call, load the `figma-use` skill. Before the first
  `create_new_file` call, load `figma-create-new-file`. Skipping this causes silent,
  hard-to-debug failures.
- These are **plugin** skills, not project skills, so they are not on disk under
  `.claude/skills/` and `Read` cannot reach them.
- **Route A: the `Skill` tool. The names are namespaced: `figma:figma-use` and
  `figma:figma-create-new-file`.** A bare `figma-use` is not in the listing. This is
  the route to take.
- Route B: if `Skill` is absent or disabled, load them through `get_figma_skill` from
  the Figma server. `skill://index.json` returns the full skill index. The tool was
  called `read_skill_uri` until the server renamed it; a definition still naming the
  old one leaves the agent with no reachable route and it will correctly stop.
- **Always pass `skillNames` on the `use_figma` call**, whichever route you took.
  Unprefixed after Route A (`"figma-use,figma-create-new-file"`), prefixed with
  `resource:` after Route B.
- **If neither route is reachable, stop and report.** Do not call `use_figma`
  unskilled and hope it works.
- If the Figma tools ever vanish from the designer mid-session, the usual cause is
  that the agent definition was edited while it was running: definitions load at
  launch, so the running agent still holds the old one. Restart, then retry.

## Creating a new file

`create_new_file` needs a `planKey`, not a project id.

- **planKey:** `team::1600490864286182601`
- **projectId:** `639157253`
  ([open the project](https://www.figma.com/files/team/1600490864286182601/project/639157253))
- **The existing design file:** `z4fVzRjRFwYpLae22BmNKy`. Every Figma tool needs a
  `fileKey` and nothing lists a project's files, so without this an agent cannot reach
  the work at all and has to ask for a link before it can start.

Pass both, so the file lands in the ToraBarabim project rather than the plan's loose
drafts folder. `whoami` may list other plans on the same grant; they belong to other
projects, so never create ToraBarabim work in one of them.

**Creation is the only moment that decides where the file lives and what it is
called, so both are settled before the call, never after.** Without a `projectId` the
file lands in drafts, and no tool of yours can move it out or rename it; the human is
left doing it by hand. So a create call carries the `projectId` above and a final
Hebrew name the human would recognize in a list. If either is missing or you are
guessing at the name, **stop and ask** rather than creating something that will have
to be cleaned up.

A newly created file is safe by construction: it is never a shared library, so you may
write to it freely.

## File-level actions are the human's, not yours

You can create a file and write inside it. You cannot **duplicate**, **delete**,
**move**, or **rename** one. The server exposes `create_new_file` and nothing else at
file level, and the Plugin API only operates inside an already-open document.

So do not promise any of those, and do not leave scratch files behind casually: every
one becomes a manual cleanup task for the human. If you must create a throwaway, name
it so it is obviously disposable and say in your report that the human has to delete
it.

## You cannot duplicate a file, which is why the unit of work is a page

There is **no way for you to duplicate an existing Figma file.** `create_new_file`
makes a blank file and nothing copies into it. `clone()` exists only on nodes and
pages, and always parents the copy inside the same file. The only cross-file APIs are
import-by-key for published library assets, which pull single components or styles,
not a file.

This is what shapes the rule above: since a safe copy of a file is not something you
can make, the copy you work on is a **page** inside the file, made with
`page.clone()`, and the file itself is the project's own. A whole-file duplicate is
the human's to make in the Figma UI, and only they can hand you its key.

## The rules that bite (full detail is in the skill)

- Return every created and mutated node id from every script:
  `return { createdNodeIds: [...], mutatedNodeIds: [...] }`. Later calls have no other
  way to reference them.
- Colours are 0 to 1, not 0 to 255.
- Switch pages only with `await figma.setCurrentPageAsync(page)`. The sync setter
  throws. At most one page switch per call; fan multi-page work out into parallel
  calls instead.
- A page you have not switched to reports zero children. That is lazy loading, not
  missing content. Verify by loading the page, never by reading `children` across
  `figma.root.children`.
- `appendChild` to an auto-layout parent first, then set `FILL` or `HUG`. The reverse
  order is rejected.
- Load the font and `await` it before mutating any text, including `appendChild` onto
  text nodes. Verify style names with `listAvailableFontsAsync` rather than guessing:
  "Semi Bold" is not "SemiBold".
- **Hebrew fonts:** confirm the family you want is actually available before you build
  with it, and confirm it carries the weights you need. A missing Hebrew face fails at
  the first text node, after you have already built the frame around it.
- **Set text direction to RTL and alignment to the start edge** on every text node.
  A Figma frame does not inherit direction the way a web page does.
- `figma.createAutoLayout(direction, props)` builds a frame with both axes already
  hugging, which sidesteps most of the sizing-order traps above. Prefer it over
  `createFrame` plus manual layout setup.
- Build incrementally: roughly ten operations per call, validate with `get_metadata`
  or a screenshot, fix before moving on.
- A failed script is atomic and changed nothing. Read the error, fix it, then retry.
  Do not retry blind.

## Where you work: the project's file, never drafts

The work belongs in the ToraBarabim project's own file, so that what the human opens
is the real thing rather than a copy someone has to reconcile later. Drafts were the
old rule and produced exactly that: a file nobody could move out, because nothing at
file level is yours to move.

- **A small change is made in place**, beside the original, inside the file itself.
- **A large change gets its own page**, next to the source page, and lives there for as
  many rounds as the design needs. Once the human approves it, the source page is
  updated from it and the extra page is deleted.
- **Nothing is deleted until the human has approved the design it belongs to.** Not the
  extra page, not the original. Figma keeps version history, but that is a recovery
  path, not a licence.
- **A published library is still off limits.** Before any write to an existing file
  key, confirm the file is not one. If you cannot tell, stop and ask.

## Looking at your own work

`get_screenshot` returns a `https://www.figma.com/api/mcp/asset/<uuid>` URL, not an
image. You have to fetch it to a local file with `Bash` and then read it, so viewing
your own work needs `Bash` plus permission to curl that host.

Cheaper alternative when you are mid-script: `await node.screenshot()` inside
`use_figma` returns the image inline in the tool result, with no curl and no
permission prompt. Prefer it.

## Other Figma skills worth loading

Beyond the two mandatory ones there are more. Two are directly ours:
`figma:figma-generate-design` when building a full screen or view from code, and
`figma:figma-generate-library` for any component work, including a single component.
Load them alongside `figma:figma-use`, not instead of it.

## Server name, and why the tools line is exact-match

The Figma MCP server is exposed under **two different names depending on where the
agent runs**: `mcp__Figma__*` and `mcp__707ae073-602d-4776-8af6-8ce9f64a7b10__*`. The
designer's frontmatter lists the same nine tools under both spellings on purpose, so
its capabilities do not depend on which environment picked it up. Keep the two lists
identical; a tool added to one and not the other reintroduces exactly the drift this
is here to prevent.

A name the running session does not expose grants zero tools silently, and from
inside the agent that is indistinguishable from a revoked grant: the designer has
already reported itself blocked and misdiagnosed the cause that way. So when Figma
tools go missing, **read the live tool list before trusting this file or the
frontmatter.** What the session actually exposes wins over what is written here.

The tools are listed by full name with no wildcard. The cost of exact-match is that a
tool newly added to the server stays ungranted until someone adds it to both lines, so
if a Figma capability you expect is missing, check the agent frontmatter before
assuming the server lacks it.

## If the tools are missing

Say so and stop. Do not hand back a written build spec as if the job were done. An
unapplied design is a blocked task, not a deliverable.
