## 🪁 Vyzed

Will add more info here as we go

### 🌈 Setup the envs

Create a `.env` file in the root of each package.

**packages/prisma/.env**

```bash
# mongoDB connection string
DATABASE_URL=
```

**packages/client/.env**

```bash
# Clerk is what we use for authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_SECRET_KEY=
# Port here should match apollo port
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**packages/server/.env**

```bash
NODE_ENV="development"
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
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
