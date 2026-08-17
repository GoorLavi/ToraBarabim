# Built with `docker build -f server/Dockerfile .` from the repo root: the
# npm workspaces layout means the server build needs the root lockfile and
# the common workspace, both outside the server directory.

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
RUN npm run build -w server

FROM manifests AS prod-deps
RUN npm ci --omit=dev --workspace server --include-workspace-root \
    && mkdir -p server/node_modules

FROM --platform=linux/arm64 node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --home /app app
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY server/package.json ./server/package.json
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
