# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ---- build: install deps (postinstall compiles Paraglide) and build Nitro output
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
# Paraglide's postinstall needs the inlang project and messages at install time
COPY package.json package-lock.json ./
COPY src/i18n ./src/i18n
RUN npm ci
COPY . .
# SKIP_ENV_VALIDATION: src/env.ts must not require secrets while building
RUN SKIP_ENV_VALIDATION=1 npm run build

# ---- migrate-deps: only what scripts/migrate.mjs needs, pinned to the lockfile versions
FROM node:${NODE_VERSION}-alpine AS migrate-deps
WORKDIR /migrate
COPY --from=build /app/node_modules/drizzle-orm/package.json ./drizzle-orm.json
COPY --from=build /app/node_modules/pg/package.json ./pg.json
RUN node -e 'const v=(f)=>require(f).version; require("fs").writeFileSync("package.json", JSON.stringify({private:true,type:"module",dependencies:{"drizzle-orm":v("./drizzle-orm.json"),pg:v("./pg.json")}}))' \
  && npm install --omit=dev --ignore-scripts --no-audit --no-fund

# ---- runtime
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
COPY --from=build --chown=node:node /app/src/server/db/migrations ./src/server/db/migrations
COPY --from=build --chown=node:node /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=migrate-deps --chown=node:node /migrate/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
