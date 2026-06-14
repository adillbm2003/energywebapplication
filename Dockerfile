# Stage 1: Build the portal frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY portal/package*.json ./portal/
RUN cd portal && npm ci
COPY portal/ ./portal/
RUN cd portal && npm run build

# Stage 2: Serve the application
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/portal/dist ./portal/dist
COPY . .
# Remove portal source files to keep image small and secure
RUN rm -rf portal/src portal/public portal/vite.config.js portal/package*.json

EXPOSE 8000
ENV NODE_ENV=production
CMD ["node", "server.js"]
