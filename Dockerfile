# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install all dependencies (including dev) to run the build
RUN npm install

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Compile TypeScript to dist/
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled output and static frontend from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# App listens on port 5000 by default (override with PORT env var)
EXPOSE 5000

CMD ["node", "dist/server.js"]
