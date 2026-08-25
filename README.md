# Prescription-to-Cart — Phase 1

Core platform foundation: auth, roles, and a modular monolith structure.
No appointments, prescriptions, pharmacy, cart, payments, calendar, AI,
Redis, or BullMQ yet — those come in later phases.

## Stack

- **Client:** React + TypeScript + Vite + Tailwind CSS, Redux Toolkit, React Router, Axios
- **Server:** Node.js + Express + TypeScript, PostgreSQL + Prisma, JWT + bcrypt + Zod

## Structure

```
prescription-to-cart-healthcare-platform/
├── client/     # React SPA
└── server/     # Express API (modular monolith: config, middleware, modules/*)
```

Server modules follow a `modules/<domain>/` pattern (`auth`, `users` for now),
each with its own `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and
`*.schema.ts` — new domains (appointments, prescriptions, etc.) plug in the
same way in later phases.

## Prerequisites

- Node.js 20+
- A running PostgreSQL instance (local or Docker)

## 1. Server setup

```bash
cd server
npm install
cp .env.example .env
# edit .env if your Postgres credentials differ from the default

npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates admin/doctor/patient users

npm run dev                           # starts API on http://localhost:4000
```

Seeded accounts (all share one dev password from `SEED_DEV_PASSWORD` in `.env`,
default `DevPass123!`):

| Email | Role |
|---|---|
| admin@prescriptiontocart.com | ADMIN |
| doctor@prescriptiontocart.com | DOCTOR |
| patient@prescriptiontocart.com | PATIENT |

## 2. Client setup

```bash
cd client
npm install
cp .env.example .env   # defaults to http://localhost:4000/api

npm run dev             # starts frontend on http://localhost:5173
```

## What's implemented

- Register / login / refresh (rotating tokens) / logout
- Role-based route protection on both server (`authenticate` + `authorize`
  middleware) and client (`ProtectedRoute` + per-role dashboards)
- `PATIENT`, `DOCTOR`, `ADMIN` roles with `PatientProfile` / `DoctorProfile`
  extension tables
- Admin-only `GET /api/users` list endpoint, demoed on the Admin dashboard
- Tailwind-styled login/register pages and a minimal dashboard shell per role
- Dark / light mode toggle (persisted to `localStorage`, respects system
  preference on first visit, no flash-of-wrong-theme on load)

## Quick API check

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prescriptiontocart.com","password":"DevPass123!"}'
```
