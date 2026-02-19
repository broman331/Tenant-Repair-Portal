# =============================================================================
# Stage 1 — Build the React frontend
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — Production runtime (API + static frontend)
# =============================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the API source
COPY src/api/ ./src/api/
COPY src/shared/ ./src/shared/

# Copy the built frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Install tsx for running TypeScript API at runtime
RUN npm install tsx

# Expose ports
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:4000/api/health || exit 1

# Start the API server (serves on port 4000)
CMD ["npx", "tsx", "src/api/server.ts"]
