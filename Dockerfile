# Use the official Node.js image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ENV NEXT_PUBLIC_API_URL=https://vyzed.fly.dev:8080

# Copy the entire monorepo to the container
COPY . .

# Install dependencies using your monorepo package manager
RUN npm ci
RUN npm run prisma:generate
RUN npm run client:build

# Set the default command to run your server
CMD ["sh", "-c", "npm run server:start & npm run client:start"]

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 4000