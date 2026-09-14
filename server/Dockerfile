# Built with `docker build -f server/Dockerfile .` from the repo root: the
# npm workspaces layout means the server build needs the root lockfile and
# the common workspace, both outside the server directory. The runtime
# target also carries the client's framework-mode build, which the server
# mounts and serves for every non-API request (server/src/plugins/ssr.ts).

FROM --platform=linux/arm64 node:22-bookworm-slim AS manifests
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY common/package.json common/package.json
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY scraper/package.json scraper/package.json
COPY infra/package.json infra/package.json

FROM manifests AS build
RUN npm ci
COPY common ./common
COPY server ./server
COPY client ./client
RUN npm run build -w server
# The client's framework-mode build produces both halves the runtime image
# needs: `client/build/server/index.cjs` (mounted by server/src/plugins/ssr.ts)
# and `client/build/client` (the hashed assets it references). No API address
# is passed, matching the deploy workflow's own client build: the built site
# calls `/v1/...` against whatever origin served it.
RUN npm run build -w client

FROM manifests AS prod-deps
# The client half of the runtime image is React Router's server bundle, and
# only `styled-components` is bundled into it (client/vite.config.ts); every
# other dependency it imports (react, react-dom, react-router, TanStack
# Query) stays a real `require()` at runtime, so the client workspace's own
# production dependencies must be installed here too, not just the server's.
RUN npm ci --omit=dev --workspace server --workspace client --include-workspace-root \
    && mkdir -p server/node_modules client/node_modules

FROM --platform=linux/arm64 node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --home /app app
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/server/node_modules ./server/node_modules
COPY --from=prod-deps /app/client/node_modules ./client/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/build ./client/build
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN chown -R app:app /app
USER app
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "dist/index.js"]

# Runs `drizzle-kit migrate` against DATABASE_URL from the task's own
# environment. Built from the `build` stage, which still has dev
# dependencies (drizzle-kit) and the generated `server/drizzle` SQL files.
FROM build AS migrate
RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --home /app app \
    && chown -R app:app /app
USER app
WORKDIR /app/server
CMD ["node", "../node_modules/.bin/drizzle-kit", "migrate"]
