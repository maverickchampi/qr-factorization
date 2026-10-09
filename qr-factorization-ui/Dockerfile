FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_AUTH
ARG VITE_API_STATS

ENV VITE_API_AUTH=$VITE_API_AUTH
ENV VITE_API_STATS=$VITE_API_STATS

RUN npm run build

FROM node:24-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
