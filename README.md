# Prescription-to-Cart — Phase 2

Phase 1 core platform (auth, roles, modular monolith) plus Phase 2
appointments: doctor availability management and patient booking.
Prescriptions, pharmacy, cart, payments, calendar sync, AI, Redis, and
BullMQ are still intentionally excluded and will be added in later phases.

## Stack

- **Client:** React + TypeScript + Vite + Tailwind CSS, Redux Toolkit, React Router, Axios
- **Server:** Node.js + Express + TypeScript, PostgreSQL + Prisma, JWT + bcrypt + Zod

## Structure

```
prescription-to-cart-healthcare-platform/
├── client/     # React SPA
└── server/     # Express API (modular monolith: config, middleware, modules/*)
```

Server modules follow a `modules/<domain>/` pattern (`auth`, `users`,
`appointments`), each with its own `*.routes.ts`, `*.controller.ts`,
`*.service.ts`, and `*.schema.ts` — new domains (prescriptions, pharmacy,
etc.) plug in the same way in later phases.

## Prerequisites

- Node.js 20+
- A running PostgreSQL instance (local or Docker)

## 1. Server setup

```bash
cd server
npm install
cp .env.example .env
# edit .env if your Postgres credentials differ from the default

npx prisma migrate dev --name add_appointments   # creates/updates tables
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

**Phase 1 — core platform**
- Register / login / refresh (rotating tokens) / logout
- Role-based route protection on both server (`authenticate` + `authorize`
  middleware) and client (`ProtectedRoute` + per-role dashboards)
- `PATIENT`, `DOCTOR`, `ADMIN` roles with `PatientProfile` / `DoctorProfile`
  extension tables
- Admin-only `GET /api/users` list endpoint, demoed on the Admin dashboard
- Tailwind-styled login/register pages and a minimal dashboard shell per role
- Dark / light mode toggle (persisted to `localStorage`, respects system
  preference on first visit, no flash-of-wrong-theme on load)

**Phase 2 — appointments**
- Doctors open bookable `AvailabilitySlot`s (30-min windows, overlap-checked)
- Patients browse the doctor directory, pick a doctor, and book an open slot
  (booking is transactional — a slot can't be double-booked)
- Doctors confirm (`PENDING → CONFIRMED`) and complete
  (`CONFIRMED → COMPLETED`) appointments from their dashboard
- Either party can cancel an active appointment, which frees the slot back
  up for rebooking
- Admins get a read-only, platform-wide appointments table
- New routes: `/patient/appointments`, `/doctor/availability`,
  `/doctor/appointments`, `/admin/appointments`
- Seed script now also creates 4 sample availability slots for the demo
  doctor so the booking flow has data out of the box

## Quick API check

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prescriptiontocart.com","password":"DevPass123!"}'
```
