# HUMM

A playful minimal mobile app concept that encourages preschoolers to hum along with a friendly baby mammoth companion. The project is split into a TypeScript React frontend and a TypeScript Node.js backend.

## Structure

- `frontend/` – Vite + React + TypeScript UI implementing the HUMM concept art and interactive rewards.
- `backend/` – Express server with basic session tracking endpoints to support the UI prototype.

## Frontend

### Scripts

```bash
npm install --prefix frontend
npm run dev --prefix frontend
npm run build --prefix frontend
npm run lint --prefix frontend
```

The development server runs on port `5173` by default. The UI is optimized for mobile breakpoints, offering soft pastel colors, a dancing 3D-style mammoth illustration, animated musical notes, humming progress feedback, and banana rewards.

## Backend

### Scripts

```bash
npm install --prefix backend
npm run dev --prefix backend
npm run build --prefix backend
npm run start --prefix backend
npm run lint --prefix backend
```

The backend exposes a lightweight Express API:

- `GET /health` – Service health check.
- `POST /sessions` – Record a humming session (`{ durationMs, bananasEarned }`).
- `GET /sessions` – Retrieve stored sessions for the runtime.

## Development Notes

- The monorepo root `package.json` enables npm workspaces for shared dependency management.
- Static assets for the mammoth, bananas, and settings gear are hand-crafted SVGs tailored to the HUMM visual style.
- No persistent database is included; the backend keeps data in memory for rapid prototyping.
