## 🪁 Vyzed

Will add more info here as we go

### 🌈 Setup the envs

Create a `.env` file in the root of each package.

**packages/prisma/.env**, and also in client and server (both load Prisma)

```bash
# mongoDB connection string (must be a replica set, e.g. Atlas)
DATABASE_URL=
```

**packages/client/.env**

```bash
DATABASE_URL=
# Better Auth
BETTER_AUTH_SECRET= # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
# Resend (emails for verification / password reset)
RESEND_API_KEY=
EMAIL_FROM="Vyzed <noreply@yourdomain.com>"
# Port here should match apollo port
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**packages/server/.env**

```bash
NODE_ENV="development"
DATABASE_URL=
# Must match the client so the API can read the session
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
PORT=4000
```

### 🚀 Running locally

```bash
# Install packages
npm install
# Generates types defs for ORM / also generates enums for app
npm run prisma:generate
# Run the API
npm run server:dev
# Run the APP
npm run client:dev
```
