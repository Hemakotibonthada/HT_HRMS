# HT Connect - Setup Guide

```
+-------------------------- HT CONNECT ---------------------------+
|                                                                 |
|   [ React + Vite SPA ] <-> [ Express API ] <-> [ PostgreSQL DB ]|
|          (frontend)           (backend)            (data)       |
|                                                                 |
|   Styling: Tailwind CSS | Auth: JWT | Container: Docker         |
+-----------------------------------------------------------------+
```

## 1. Repository Layout (at a glance)

```
HT_Work/
|-- frontend/    <- React + Vite SPA, Tailwind styling, serene coastal theme
|   |-- src/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   +-- package.json
|-- backend/     <- Express API, Prisma schema, migrations & seed scripts
|   |-- prisma/
|   |-- src/
|   +-- package.json
|-- docker-compose.yml
|-- README.md    <- Deep dive into features and modules
`-- SetUP.MD     <- (this file) practical boot guide
```

## 2. Color System (Serene Coastal / Spa Palette)

```
+------------------- Palette Key -------------------+
| Role      | Hex     | Usage Hint                  |
|-----------|---------|-----------------------------|
| Primary   | #BDECB6 | Large backgrounds, cards    |
| Secondary | #87CEEB | Buttons, headers, badges    |
| Accent    | #C2B280 | Highlights, chips, callouts |
| Neutral   | #F7F7F0 | Page canvas, light surfaces |
+---------------------------------------------------+
```

- Tailwind `theme.extend.colors` and shared UI components (`Button`, `Card`, `Badge`, `Avatar`) already reference these shades.
- Gradients blend secondary <-> primary for calm hero areas; accent is reserved for subtle contrast.

## 3. Prerequisites

```
+-------------------- Dev Toolbox -------------------+
| Node.js 18+        | Frontend & API runtime        |
| npm                | Package manager               |
| Docker + Compose   | Optional full stack harness   |
| PostgreSQL 15+     | Local database (if not Docker)|
| PowerShell or CMD  | Windows shells                |
+----------------------------------------------------+
```

Install the above before continuing. Windows users can stay in PowerShell; `cmd` works equally well.

## 4. Environment Variables

```
+------------------ Config Files ------------------+
| backend/.env                                    |
|   DATABASE_URL="postgresql://..."                  |
|   JWT_SECRET="change-me"                           |
|                                                  |
| frontend/.env                                   |
|   VITE_API_BASE_URL="http://localhost:4000"       |
+-------------------------------------------------+
```

Copy `.env.example` files if present, or create new files matching the structure above.

## 5. Local Development Flow

### 5.1 Spin up PostgreSQL (if not using Docker)

```
+------------------- Postgres Boot ------------------+
| Option A | docker run --name ht-db ...             |
| Option B | Install locally (pgAdmin / installer)   |
+----------------------------------------------------+
```

Point `DATABASE_URL` at the live instance.

### 5.2 Backend (Express + Prisma)

```
+---------------- Backend Routine -----------------+
| cd backend                                        |
| npm install                                       |
| npx prisma migrate dev                            |
| npm run prisma:seed                               |
| npm run dev    # API served at http://localhost:4000 |
+--------------------------------------------------+
```

> Seeded logins: `admin@htconnect.local / Admin@123`, `pm@htconnect.local / Pm@12345`, `engineer@htconnect.local / Employee@123`.

### 5.3 Frontend (React + Vite)

```
+---------------- Frontend Routine ----------------+
| cd frontend                                       |
| npm install                                       |
| npm run dev   # Vite dev server at http://localhost:5173 |
+--------------------------------------------------+
```

Vite proxies API requests to `VITE_API_BASE_URL`. Watch the console for CORS or auth warnings.

## 6. Docker Compose Workflow (One Command Stack)

```
+---------------- Docker Stack ----------------+
| docker compose up --build                    |
|   |-- frontend -> http://localhost:8080      |
|   |-- backend  -> http://localhost:4000      |
|   `-- postgres -> localhost:5432             |
|                                              |
| docker compose exec backend npx prisma db seed |
+---------------------------------------------+
```

Compose handles migrations automatically; run the seed command once to load demo data.

## 7. Development Rhythm

```
+---------------- Daily Loop ----------------+
| 1. git pull                                 |
| 2. npm install (if needed)                  |
| 3. npm run lint / npm test                  |
| 4. Build feature                            |
| 5. npm run lint                             |
| 6. git commit                               |
+-------------------------------------------+
```

- Linting: run `npm run lint` in `frontend/` and `backend/`.
- Testing: add `npm test` targets as coverage grows.
- Formatting: ESLint + Prettier rules keep style consistent.

## 8. Troubleshooting Cheatsheet

```
+---------------- Common Fixes ----------------+
| API fails to start -> check DATABASE_URL, rerun prisma migrate. |
| Login returns 401 -> seed users, restart backend.               |
| Vite HMR stuck -> delete node_modules/.vite then restart.       |
| Docker DB conflicts -> docker compose down -v.                  |
+---------------------------------------------------------------+
```

## 9. Visual Landmarks (Serene Theme)

```
+----------------- UI Cues ------------------+
| Header ribbons -> Muted Sky gradients       |
| Cards & forms -> Soft Aqua frosting         |
| Badges/CTAs  -> Sandy Beige accents         |
| Backgrounds  -> Warm Off-White canvas       |
+-------------------------------------------+
```

The palette delivers spa-like calm: high readability, low glare, and smooth gradients. Use the same hues for new modules to keep the experience cohesive.

---

```
+------------------------------+
| Pick local dev or Docker.    |
| Seed Prisma.                 |
| Log in with demo accounts.   |
+------------------------------+
```
