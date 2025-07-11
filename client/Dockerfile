# === Build stage ===
FROM node:24 AS builder

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
COPY common ./common

# Rebuild Rollup native binary to match Linux arch
RUN cd client && npm rebuild rollup && npm run build

# === Runtime stage ===
FROM node:24

RUN npm install -g serve
WORKDIR /app

COPY --from=builder /app/client/dist ./dist

EXPOSE 4501
CMD ["serve", "-s", "dist", "-l", "4501"]
