FROM node:18.16.0 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM node:18.16.0

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=development

RUN npm ci --only=development

CMD ["npm", "run", "start:dev"]
