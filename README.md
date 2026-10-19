# Vyzed

A marketplace where learners find teachers and book one-on-one lessons.

## Stack

| Layer       | Choice                                                          |
| ----------- | --------------------------------------------------------------- |
| Monorepo    | pnpm workspaces + Turborepo                                     |
| Language    | TypeScript 7 (`tsc` is the type checker everywhere)             |
| Web         | TanStack Start (Vite 8, SSR) + TanStack Router + TanStack Query |
| UI          | shadcn/ui + Tailwind CSS v4 (`packages/ui`)                     |
| API         | Hono on Node, typed RPC client shared with the web app          |
| Auth        | Better Auth with email one-time codes (passwordless)            |
| Database    | MongoDB Atlas + Mongoose                                        |
| Email       | Resend (codes are logged to the console when no API key is set) |
| Lint/format | oxlint (type-aware) + oxfmt                                     |
| Tests       | Vitest                                                          |

## Layout

```
apps/
  web/        TanStack Start app — public pages are SSR'd, /dashboard is client-only
  api/        Hono API + Better Auth (exports `AppType` for the RPC client)
packages/
  shared/     Zod schemas, types, timezone-aware slot generation (+ tests)
  db/         Mongoose models and connection
  ui/         shadcn components and global styles
  tsconfig/   Shared tsconfig presets
```

## Getting started

Requires Node 22+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # fill in MONGODB_URI and BETTER_AUTH_SECRET
cp apps/web/.env.example apps/web/.env
pnpm dev                                 # web on :3000, API on :4000
```

Generate a secret with `openssl rand -base64 32`. Booking uses MongoDB transactions, so
the database must be a replica set — every Atlas cluster (including the free tier) is one.

Without `RESEND_API_KEY`, sign-in codes are printed in the API terminal.

## Scripts

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Run web + API with hot reload    |
| `pnpm build`     | Production builds                |
| `pnpm typecheck` | `tsc` (TS 7) across all packages |
| `pnpm lint`      | oxlint with type-aware rules     |
| `pnpm format`    | Format with oxfmt                |
| `pnpm test`      | Vitest                           |

## How scheduling works

- All instants are stored in UTC. Each teacher's availability is a set of weekly windows
  (`weekday`, `startMinute`, `endMinute`) interpreted in their IANA time zone, so slots keep the
  same local time across DST changes.
- `GET /api/teachers/:id/slots` expands those windows into bookable start times, minus existing
  pending/confirmed bookings and a 60-minute notice period.
- `POST /api/bookings` re-checks the slot inside a transaction that also increments a
  per-teacher counter, so concurrent requests for overlapping times can't both succeed. A
  partial unique index on `(teacherId, startUtc)` is a second safeguard.
- Bookings start as `pending`; the teacher confirms, and either side can cancel.

## API overview

| Route                                               | Access      |
| --------------------------------------------------- | ----------- |
| `/api/auth/*`                                       | Better Auth |
| `GET /api/me`, `POST /api/me/role`                  | signed in   |
| `GET /api/teachers`, `/:id`, `/:id/slots`           | public      |
| `GET/PUT /api/teacher/profile`, `/availability`     | teachers    |
| `GET/POST /api/bookings`, `PATCH /api/bookings/:id` | signed in   |

## Deploying

- **API**: `pnpm --filter @vyzed/api build` produces a single bundle in `apps/api/dist`. Run it
  on Fly.io / Railway / Render in the same region as the Atlas cluster.
- **Web**: `pnpm --filter @vyzed/web build` outputs a Nitro server in `apps/web/.output`.
- Host them on the same site (e.g. `vyzed.com` and `api.vyzed.com`) so the session cookie works.
- In production `autoIndex` is off: run `syncIndexes()` for the models as a deploy step.

## Editor note

TypeScript 7 is the native compiler. In VS Code, install the **TypeScript (Native Preview)**
extension so the editor uses the same version as `tsc`.
