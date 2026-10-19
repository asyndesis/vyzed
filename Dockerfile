# One image runs both servers: the web app listens publicly and proxies /api to the API on
# localhost, which keeps a single small Fly machine and first-party auth cookies.
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build
# The API bundle inlines workspace packages but still needs its npm dependencies.
RUN pnpm --filter @vyzed/api deploy --prod --legacy /out/api && cp -r apps/api/dist /out/api/

FROM base
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 API_INTERNAL_URL=http://localhost:4000
COPY --from=build /out/api ./api
COPY --from=build /app/apps/web/.output ./web/.output
COPY start.sh ./
EXPOSE 3000
CMD ["bash", "start.sh"]
