# 🎓 Vyzed

A teaching app.

## 🚀 Quick start

```bash
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET
npm install
npm run db:migrate
npm run db:seed        # optional sample data
npm run dev            # http://localhost:3000
```

## 🧰 Stack

TanStack Start · GraphQL (Pothos + gql.tada) · Postgres + Drizzle · Better Auth · Tailwind + shadcn

## ☁️ Deploy

```bash
fly deploy   # runs migrations first, then ships
```

Secrets live in `fly secrets`; everything else lives in `fly.toml`.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
