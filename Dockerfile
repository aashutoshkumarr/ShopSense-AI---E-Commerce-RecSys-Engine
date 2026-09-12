# ==============================================================================
# ShopSense AI Commerce OS - Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build Frontend (Vite) and Backend (esbuild)
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (cached if package files unchanged)
COPY package*.json ./
RUN npm ci

# Copy full application source
COPY . .

# Run production build (Vite client + esbuild server bundle)
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Run as unprivileged non-root user
USER node

# Expose dynamic application port
EXPOSE 3000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
