# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY patches ./patches/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
