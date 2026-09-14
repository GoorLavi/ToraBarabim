# 0023: The public pages are server rendered

- **Status:** proposed
- **Date:** 2026-09-13
- **Decided by:** project owner
- **Refines:** [0010](0010-production-shape-traded-for-cost.md), which chose the
  production shape when the server answered only with JSON

## Context

The site was a static single page app. CloudFront rewrote every path to `index.html`,
S3 returned the same file to everyone, and React drew the page in the browser. Every
URL therefore carried the same `<title>`, the same description, and a `canonical`
pointing at `/`.

That last one is not a missing feature, it is an instruction. It told Google that the
rabbi page and the city page were copies of the home page, so they were folded into it
rather than indexed. Someone searching a rabbi's name, or "שיעורי תורה" and a place,
could not arrive. `sitemap.xml` carried one URL, so those pages were never offered for
crawling either.

Organic search is how this product is found. A person deciding where to learn tonight
does not know the site exists; they type a name or a neighbourhood. Making that work is
not an optimisation layered on the product, it is the distribution channel.

Two smaller things failed for the same reason. WhatsApp and Facebook do not run
JavaScript when they build a link preview, and this audience shares lessons by
WhatsApp. And search engines other than Google render JavaScript far less reliably than
Google does.

## Decision

**The public pages are rendered on the server, using React Router 7 framework mode,
mounted on the existing Fastify server.**

The client already depended on `react-router-dom@7`, which is Remix, so this is an
upgrade inside the library in use rather than a move to another ecosystem. The route's
`meta` and `loader` sit beside its component, so the title, the description and the
canonical are computed from the same data the page renders. There is no second template
and no duplicated markup.

The handler runs in the same process as the API. A `loader` calls a service directly,
with the configuration and the database connection already open, and never makes an
HTTP request back to this application. There is no new container and no new AWS
resource.

**A render failure never produces a blank page.** `onShellError` returns a usable shell
so the browser can recover, and CloudFront maps the origin's 500, 502, 503 and 504
responses to a static outage page in the client bucket, a mapping established by taking
the service down and observing what it actually returned, not by reading documentation.
Both are required, not optional: the document now depends on the server in a way it
never did before.

This was decided after a spike that server rendered one page and answered four
questions against this repository rather than against documentation. All four came back
sound, and the spike's findings are the substance of the consequences below.

## Consequences

**Availability is coupled where it was not.** Previously a dead server left the site
standing and showing error states, because S3 served the document. Now the document
itself comes from Fargate. Scaling the service to zero to test the fallback showed what
that costs: the whole site went down, not just its data. The service therefore runs two
tasks rather than one, so a single task failing is no longer a site outage, and the
fallbacks above are the second line rather than the only one.

**TypeScript moved from 7 to 6.** `@react-router/dev` declares support for `^5 || ^6`.
The alternative was installing with `--legacy-peer-deps` and carrying a forced install
into the repository, which is the kind of thing that is invisible until it breaks.

**No new AWS line item, but the bill does move.** Server rendering itself adds no
resource: the container was already paid for around the clock. The second task does,
and it is the cost of the availability above, roughly seven dollars a month plus a
second public IP. Two tasks at `0.25 vCPU` cost about what one at `0.5 vCPU` would, so
the same money buys headroom and survival rather than headroom alone. Caching the HTML
at CloudFront absorbs crawler traffic, which is the bulk of it. **This supersedes
[0010](0010-production-shape-traded-for-cost.md)'s "roughly 30 to 34 dollars a month at
rest"**, which was written for a single task; 0010 is accepted and therefore not edited.
**These are estimates, not measurements**, and cannot become measurements until the
change serves real traffic.

**The deploy order reverses, and it is now load bearing.** The document references
hashed asset filenames, so assets must reach their bucket before the server that points
at them, which is the opposite of today's pipeline. The `--delete` on the asset sync has
to go as well: it would break both open browser tabs and the static fallback.

**The framework owns the document.** `index.html`, `main.tsx` and `App.tsx` are gone,
replaced by `root.tsx`. The hand written scroll restoration and error boundary are
deleted in favour of the router's own, rather than left beside them.

**Node's types are now visible throughout the client's type checking.** A loader and its
component share a file, which is the framework's shape, so the client's TypeScript
program has to see the server code the loader imports.

**The admin and rabbi panels are server rendered too.** The rendering path is uniform
and only the data strategy differs: those routes fetch in the browser, are marked
`noindex`, and stay out of the sitemap. Two rendering paths would have meant two sets of
bugs for no gain, and a server side session check removes the flash of the panel that a
client side redirect leaves.

**This decision needed a safety net, and getting one reversed
[0008](0008-no-automated-tests-yet.md).** A refactor across roughly three hundred client
files with nothing able to catch a regression was the real risk, larger than any
technical difficulty in the migration itself.

## Rejected

**Next.js.** The more conventional answer, and a worse fit here. It means dropping
react-router entirely, rehoming styled-components against the App Router, and either
running a second container or rewriting the Fastify API into route handlers. React
Router 7 already had SSR, so the standard path was also the shorter one.

**Composing the document by hand on the server.** Swapping head tags into the built
`index.html` with string replacement and seeding the body with a small server side
template. Cheapest by far, and it was proposed first. Rejected because it is a bespoke
mini framework: a second template duplicating markup that already exists in components,
an ordering constraint in the deploy, and a shape only its author understands. Building
that underneath the product's main growth channel was the wrong place to save effort.

**Prerendering at build time.** Standard, genuinely simpler, zero marginal cost, and it
keeps the static fallback intact. Rejected because a new rabbi or a new lesson would not
appear until the next build, and a freshly shared link would preview wrong. Worth
remembering that framework mode can switch to this with configuration rather than a
rewrite, if the availability coupling above ever proves too expensive.

**Lambda@Edge injecting the head tags.** Keeps the static site and adds per page
metadata at the edge. Rejected as a us-east-1 deployment and a second runtime to
understand, for a site whose whole budget is thirty dollars a month.
