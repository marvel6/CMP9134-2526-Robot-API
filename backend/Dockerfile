FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/server.js"]
