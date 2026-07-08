# NYU Health Finder

> **Find a clinic faster than waiting 3 weeks for the NYU Student Health Center.**

A full-stack web app for NYU students to discover vetted NYC clinics that accept the NYU student health insurance plan (SHIP), with real wait times, walk-in availability, insurance filtering, and side-by-side clinic comparison.

**Live demo:** https://be2a33e3-cb52-4bde-85d1-1a7abb2a3a60-00-1nrv0l4y67arr.janeway.replit.dev

---

## The problem

The NYU Student Health Center averages ~21 days to get an appointment. When you have strep throat or a mystery rash, you need care now — and most students don't know there are faster, insurance-covered alternatives a few blocks away.

---

## Features

- **Clinic directory** — 46 clinics across Manhattan, Brooklyn, and Queens with wait times, ratings, walk-in availability, and accepted insurance plans
- **Smart filters** — search by specialty, specific insurance plan, borough/neighborhood drill-down, and NYU SHIP toggle
- **Clinic comparison** — select 2–3 clinics and compare them side-by-side; shareable via URL (`/compare?ids=1,2,3`)
- **NYU baseline card** — the Student Health Center is pinned as a reference point (not mixed into the alternatives list)
- **Appointment booking** — schedule and manage appointments per clinic
- **Insurance info** — detailed breakdown of NYU's insurance plans (SHIP, Dental & Vision add-on, waivers)

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast HMR, great DX |
| Styling | Tailwind CSS + shadcn/ui | Consistent design system, no fighting CSS |
| API | Express 5 + TypeScript | Lightweight, familiar |
| Database | PostgreSQL + Drizzle ORM | Type-safe queries, schema-as-code |
| API contract | OpenAPI 3.1 spec (Orval codegen) | Schema is the single source of truth; auto-generates React Query hooks + Zod validators for both client and server |
| Monorepo | pnpm workspaces | Shared types between `lib/api-spec`, `lib/db`, and the two artifacts |
| Validation | Zod v4 + drizzle-zod | Runtime safety without duplication |

The key architectural decision is **contract-first API design**: the OpenAPI spec in `lib/api-spec/openapi.yaml` is the single source of truth. Running `pnpm --filter @workspace/api-spec run codegen` generates type-safe React Query hooks for the frontend and Zod schemas for the server — no hand-written fetch calls or duplicated type definitions.

---

## Project structure

```
artifacts/
  api-server/        # Express 5 REST API (port 8080, proxied at /api)
  nyu-health-finder/ # React + Vite frontend (port assigned by Replit)
lib/
  api-spec/          # OpenAPI 3.1 spec + Orval codegen config
  api-client-react/  # Generated: React Query hooks (do not edit by hand)
  db/                # Drizzle ORM schema + db client
```

---

## Running locally

```bash
# Install dependencies
pnpm install

# Push DB schema (requires DATABASE_URL env var)
pnpm --filter @workspace/db run push

# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend (separate terminal)
pnpm --filter @workspace/nyu-health-finder run dev

# Regenerate API hooks after editing openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Full typecheck
pnpm run typecheck
```

**Required env vars:**
```
DATABASE_URL=postgres://...
SESSION_SECRET=...
```

---

## Data note

Clinic data is seeded and representative — real addresses and phone numbers for key locations (NYU Student Health Center at 726 Broadway, CityMD Union Square, CityMD Chelsea), with plausible synthetic data for the rest. Wait times and ratings are illustrative. A production version would pull from Google Maps API, Zocdoc, or a curated dataset.

---

## What I'd build next

- Live wait time / availability data via Zocdoc or Google Maps API
- User accounts with appointment history and insurance card storage
- Push notifications for earlier appointment slots
- Doctor profiles with specialties and reviews
- Geolocation-based "nearest clinic" sort
