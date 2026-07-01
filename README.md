# clinic-web

React + Vite + Tailwind + shadcn/ui frontend for the Clinic Management SaaS. **Phase 0.**

Authentication is **Clerk**. Each clinic is a **Clerk Organization**; the
`OrganizationSwitcher` switches the active clinic, and the active org id is the
`clinicId` the backend scopes every request to.

## What's here (Phase 0)
- `ClerkProvider` wired in `src/main.jsx` (publishable key from `VITE_CLERK_PUBLISHABLE_KEY`).
- Hosted **sign-in** page (`/sign-in`) via Clerk `<SignIn>`.
- **Organization switcher** + user menu in the app header (`components/ProtectedLayout.jsx`).
- **Placeholder dashboard** (`pages/DashboardPage.jsx`) that shows:
  - the current clinic (org name + id) and your role, from Clerk;
  - the **backend-derived** context from `GET /api/me` (proves the Clerk session →
    clinicId/role flow end to end);
  - the plan + resolved feature flags from `GET /api/me/plan` (plan gating, hard rule 5).
- shadcn/ui foundation: `@/` alias, `lib/utils.cn`, Button / Card / Badge.

## Setup & run
```bash
npm install
cp .env.example .env     # set VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL
npm run dev              # http://localhost:5173
```
Requires `clinic-api` running (default `http://localhost:4000`) for the `/api/me` cards.

## Clerk configuration (one-time, in the Clerk dashboard)
1. Enable **Organizations**.
2. Define custom org roles `owner`, `doctor`, `receptionist` (the backend also maps
   Clerk's default `admin` → `owner`).
3. Copy the **publishable key** into `clinic-web/.env` and the **secret key** into `clinic-api/.env`.

## Structure
```
src/
  main.jsx                 # ClerkProvider + Router
  App.jsx                  # routes (/sign-in, protected dashboard)
  index.css                # tailwind + shadcn design tokens
  lib/ utils.js api.js
  components/
    ProtectedLayout.jsx    # header: OrganizationSwitcher + UserButton; redirects if signed out
    ui/ button.jsx card.jsx badge.jsx
  pages/ SignInPage.jsx DashboardPage.jsx
```

## NOT in Phase 0
Booking page, appointment UI, queue/TV display, reminders, billing — all later phases.
