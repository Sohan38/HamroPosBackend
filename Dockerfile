FROM node:20-bookworm-slim AS builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist
RUN npm run prisma:generate

EXPOSE 4000

CMD ["node", "dist/server.js"]
