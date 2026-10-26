@CONTRIBUTING.md

- Don't run `npm run build` while `npm run dev` is running.
- GraphQL: each component owns its fragment; `lib/queries.ts` is for queries several components share.
- Never edit migrations by hand; use `npm run db:generate`.
