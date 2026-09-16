# Must-catch findings

1. **The same lesson grid written twice in one diff.** `AreaLessonsGrid/styles.ts` and
   `RabbiLessonsGrid/styles.ts` declare the same layout: the same `repeat(2, 1fr)` /
   `repeat(3, 1fr)` at `md` / `repeat(4, 1fr)` at `xl` ladder, the same
   `> .cell { display: grid }`, around the same `LessonCard`, behind two components whose
   `.tsx` files are otherwise identical but for their names. A second place needing the
   same thing lifts to the nearest common ancestor rather than copying the block
   (`CLAUDE.md`, Scope and Boundaries; `client/CLAUDE.md`, Component Tree). Blocking.

2. **The two copies already disagree, in the commit that created them.** `RabbiLessonsGrid`
   uses `spacing.md` on a phone where `AreaLessonsGrid` uses `spacing.lg`, and it omits
   `min-inline-size: 0` on the cell. The design system fixes the lesson grid's gap at `lg`
   at every width, and a cell without `min-inline-size: 0` lets a long unbreakable place
   name push a column past its `1fr` track, which is the "layout must survive real data"
   rule. Blocking, and the concrete cost of finding 1: nobody wrote down a difference,
   the difference simply happened.

Both files are correct read on their own: the naming, the file shape, the class names,
the tokens, the logical properties, the prop spread and the keys all follow the rules.
The sin is entirely cross-file, and that is the point of this case. A reviewer that reads
one file at a time passes this diff, and four copies of this grid reached `main` exactly
that way.
