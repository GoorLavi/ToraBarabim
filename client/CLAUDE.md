# client house rules (extends root CLAUDE.md)

One React SPA, Hebrew and right-to-left throughout. React 19, Vite, TypeScript strict,
styled-components 6, TanStack Query 5, React Router 7. Import within the workspace via
the `~/*` alias (maps to `src`).

The tree shape and the styling shape below are carried over from the Why's client
deliberately. They are not preferences: mixing two shapes inside one codebase is what
they exist to prevent.

## Component Tree

A component is a **folder**, named for the component, holding these files. Only create
the ones the component actually needs.

```
LessonCard/
  LessonCard.tsx     the component. Same name as the folder.
  styles.ts          exported `css` blocks (see Styling below)
  models.ts          props, and any type this component owns
  consts.ts          every constant, including Hebrew copy and query-key factories
  api.ts             one exported function per endpoint this feature calls
  helpers.ts         pure functions this component owns
  useLessonSearch.ts one hook per file, named for what it returns
  components/        child components, each its own folder, same shape
```

- **A child component lives in its parent's `components/` folder** until a second
  parent needs it. Then it lifts to the nearest folder both parents can see, not
  straight to the top. Root `CLAUDE.md`, Scope and Boundaries.
- **The component file holds the markup and nothing else worth extracting.** When it
  grows sections that need comments to separate them, those sections are child
  components.
- **One hook per file**, colocated, named for what it returns (`useLessonSearch`,
  `useNearbyLessons`). A hook shared by two features lifts the same way a component
  does.
- Everything the root rulebook says about `models.ts`, `consts.ts`, and the `{...{ }}`
  props spread applies here.

## Styling

The root rules cover class names, `>`, `&` nesting, and `classNames`. On top of those:

- **`styles.ts` exports `css` blocks; the component file wraps its own render function
  and applies the block at the bottom.** This is the shape:

  ```tsx
  // LessonCard.tsx
  import styled from 'styled-components';
  import * as styles from './styles';
  import { LessonCardProps } from './models';

  export const LessonCard = styled(({ className, lesson }: LessonCardProps) => {
    return (
      <div className={className}>
        <h3 className='title'>{lesson.title}</h3>
      </div>
    );
  })`
    ${styles.LessonCard}
  `;
  ```

  ```ts
  // styles.ts
  import { css } from 'styled-components';

  export const LessonCard = css(({ theme }) => `
    padding-inline: ${theme.spacing.md};

    > .title { ... }
  `);
  ```

  Exporting a styled wrapper per element instead pushes DOM structure into `styles.ts`,
  so a reviewer has to hold two files open to see the markup. The two shapes cannot be
  mixed inside one component without confusing every later reader.
- **Import the style module as a namespace: `import * as styles from './styles'`.**
  Named imports of `css` blocks collide the moment two blocks share a name, and at the
  point of use they hide which file the block came from.
- **`createGlobalStyle` is the sanctioned escape hatch for DOM the component does not
  own, and the block must carry a comment naming what put that DOM out of reach** (a
  portal, a third-party widget). Without the stated reason it reads as a violation of
  the "never write flat selectors" rule and gets deleted in review.
- **Tokens come from the theme, not from raw values.** The theme is the code mirror of
  `.claude/design-system.md`. A raw hex or a raw pixel font size in a component is a
  bug.

## Hebrew and Text Direction

- **RTL is set once at the app root** (`dir='rtl' lang='he'` on the root element) and
  never re-declared per component. Layout uses logical properties, per the root
  rulebook.
- **There is no translation layer.** Hebrew copy is a plain string in the component's
  `consts.ts`, named for what it says. No i18n library, no locale files, no keys. This
  is a deliberate simplification the root rulebook guarantees will hold.
- **Text that came from the server gets `dir='auto'`** on the element that holds it: a
  rabbi's name, a place, a lesson title. A Latin word or a number inside Hebrew text
  lands on the wrong side without it, which reads as corrupted data rather than a
  direction bug.

## Data and State

- **Server data is TanStack Query, local UI state is `useState`, and zustand holds only
  ambient state shared across the whole tree.** Fetched data parked in zustand is a
  second cache with no invalidation, no refetch, and no staleness: it quietly diverges
  from the query copy other screens read, and nothing tells you which one is right.
  Reach for zustand only when you can name why the value cannot live in a query or a
  parent's `useState`.
- **Query keys are factory functions in the feature's `consts.ts`, never inline arrays
  at the call site.** An inline key is invisible to whoever writes the next
  `invalidateQueries`: the mutation succeeds, the invalidation misses by one array
  element, and the screen keeps showing stale data with no error anywhere.

  ```ts
  export const LESSON_QUERY_KEYS = {
    all: () => ['lessons'] as const,
    search: (filters: LessonFilters) => ['lessons', 'search', filters] as const,
    byId: (id: string) => ['lessons', id] as const,
  };
  ```
- **A feature owns an `api.ts`: one exported function per endpoint, with that
  endpoint's status codes in a comment above it.** Without the wrapper the status
  contract is written down nowhere and every caller re-guesses which codes it has to
  handle. Never call `fetch` directly from a component.
- **Map an API error to Hebrew user copy through one status-aware helper, with
  per-call overrides. Never render the raw error message.** Read the status off the
  error, never by parsing its message. A raw message puts `HTTP error! Status: 409` on
  screen and drops the one sentence that would have told the user what to do next.
- **URL state is the source of truth for anything shareable.** A search someone can
  send to a friend lives in the query string, not in component state. This is a lesson
  listings site: the search *is* the page.

## Safety Nets

- **Keep `React.StrictMode` and the top-level `ErrorBoundary`.** StrictMode
  double-invokes render and effects in development on purpose: a component that
  misbehaves under it has a real impure render or a missing effect cleanup, so fix the
  component rather than removing the wrapper.
- The error boundary must actually wrap the routed tree, not sit as a sibling to it. A
  boundary that does not enclose the route it is meant to protect white-screens exactly
  the same as no boundary at all.
