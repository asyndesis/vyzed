FROM node:22-alpine

WORKDIR /app

# Prisma's query engine needs OpenSSL on Alpine
RUN apk add --no-cache openssl

# Baked into the client bundle at build time; /graphql is proxied by Next
ENV NEXT_PUBLIC_API_URL=https://vyzed.fly.dev
ENV BETTER_AUTH_URL=https://vyzed.fly.dev

COPY . .

RUN npm ci
RUN npm run prisma:generate
RUN npm run client:build

ENV NODE_ENV=production
EXPOSE 3000

# API (4000, internal) in the background, Next (3000, public) in the foreground
CMD ["sh", "-c", "npm run server:start & exec npm run client:start"]
