# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install only production-necessary build tools
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --ignore-scripts

# Generate Prisma Client
RUN npx prisma generate

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy only what's needed
COPY --from=builder --chown=backend:nodejs /app/src ./src
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/prisma ./prisma
COPY --from=builder --chown=backend:nodejs /app/package.json ./

# Create logs directory
RUN mkdir -p logs && chown backend:nodejs logs

USER backend

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node --experimental-specifier-resolution=node src/server.js"]
