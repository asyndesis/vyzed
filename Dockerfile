FROM node:22-alpine

WORKDIR /app

# Prisma's query engine needs OpenSSL on Alpine
RUN apk add --no-cache openssl

ENV BETTER_AUTH_URL=https://vyzed.fly.dev

COPY . .

RUN npm ci
RUN npm run prisma:generate
RUN npm run client:build

ENV NODE_ENV=production
EXPOSE 3000

# API (4000, internal) in the background, TanStack Start (3000, public) in the foreground
CMD ["sh", "-c", "npm run server:start & exec npm run client:start"]
