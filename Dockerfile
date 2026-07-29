# Stage 1: Build the public React site from the canonical `src/` tree.
# This previously built `portal/`, a stale second copy of the same application —
# so Docker deployments shipped an older site than the AWS pipeline did.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY index.html vite.config.js eslint.config.js ./
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/
# VITE_API_URL is empty so the SPA calls the same origin that serves it.
RUN npm run build

# Stage 2: Serve the API + CMS + built SPA
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Backend, CMS admin UI and server-side data files
COPY server.cjs db.cjs migrate.cjs ./
COPY server/ ./server/
COPY app.js styles.css cms-admin.html logo.png ./

# The compiled public site, served at /portal (and /images, /guides)
COPY --from=builder /app/dist ./dist

EXPOSE 8000
ENV NODE_ENV=production
CMD ["node", "server.cjs"]
