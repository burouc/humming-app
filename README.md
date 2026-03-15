# HUMM (Next.js)

A full-stack Next.js app for a playful preschool humming experience. The client UI and server endpoints live in one repository.

## Tech stack

- Next.js App Router
- React + TypeScript
- Route Handlers for server-side API endpoints
- Zod for request validation

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API endpoints

- `GET /api/health` – Basic health response.
- `GET /api/sessions` – List in-memory humming sessions.
- `POST /api/sessions` – Create a session with `{ durationMs, bananasEarned }`.

> Session data is intentionally in-memory for prototype speed.
