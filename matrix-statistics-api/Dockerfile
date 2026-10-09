FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3011

CMD ["sh", "-c", "npm run typecheck && node server.ts"]
