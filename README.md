# Interseguro Challenge

This project contains three main services and a frontend that work together to handle authentication, QR factorization, and matrix statistics.

## Architecture overview

- Frontend: Vite + React + TypeScript
- Node API: Express + TypeScript + Node.js 24
- Go API: Go 1.23 + JWT + QR calculation
- Orchestration: Docker Compose

## Project structure

```text
.
├── docker-compose.yml
├── README.md
├── qr-factorization-ui/        # Frontend Vite + React
├── matrix-statistics-api/       # Node.js 24 API + Express
├── qr-factorization-api/        # Go 1.23 API
└── .env (for the compose build)
```

## Technologies by folder

### 1) qr-factorization-ui
Technologies:
- Vite
- React 19
- TypeScript
- Node.js 24

Purpose:
- User authentication interface
- API consumption
- Login screens, dashboard, and result visualization

Local commands:

```bash
cd qr-factorization-ui
npm install
npm run dev
```

The app is typically available at:
- http://localhost:5173

### 2) matrix-statistics-api
Technologies:
- Node.js 24
- TypeScript
- Express
- JWT
- Vitest
- Swagger/OpenAPI

Purpose:
- Expose matrix statistics endpoints
- Return structured JSON responses

Local commands:

```bash
cd matrix-statistics-api
npm install
npm run dev
```

### 3) qr-factorization-api
Technologies:
- Go 1.23
- JWT
- HTTP API
- QR factorization logic using Givens rotations

Purpose:
- Authenticate users
- Compute QR matrix factorization

Local commands:

```bash
cd qr-factorization-api
go run .
```

### 4) docker-compose.yml
Technologies:
- Docker
- Docker Compose

Purpose:
- Start the full project stack in one place
- Run the frontend and both backend services together

## Requirements

- Docker and Docker Compose

## Run the entire project

From the repository root:

```bash
docker compose up --build
```

This will start:
- Vite frontend
- Node API
- Go API
