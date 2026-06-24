# FixRight Home Repair — Booking Platform

A full-stack home repair booking website with a public-facing booking flow and a secure admin dashboard. Customers book appointments through a guided wizard; admins manage services, hours, and appointments from a backend dashboard.

🔗 Live site: <https://bookingsystem.digital>

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **Supabase** (Postgres + Auth + RLS) for data and authentication
- **React Router** for routing
- **date-fns** for date handling, **lucide-react** for icons
- Deployed to **GitHub Pages** via `gh-pages`

## Features

**Public website**
- Premium hero section and dynamic services loaded from Supabase
- 4-step booking wizard (service → date/time → details → confirmation)
- Smart availability that respects business hours, blocked dates, existing bookings, and notice time

**Admin dashboard** (`/admin`)
- Secure login via Supabase Auth + `admin_users` verification
- Appointment overview and management with status updates
- Manage services, business hours, blocked dates, and business settings

## Getting Started

```bash
npm install
npm run dev
```

- Public website: <http://localhost:5173>
- Admin dashboard: <http://localhost:5173/admin>

Configuring Supabase environment variables, setting up the database schema, and creating an admin user are covered in **[SETUP.md](SETUP.md)**.

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                    |
| `npm run build`   | Type-check and build for production          |
| `npm run preview` | Preview the production build locally         |
| `npm run lint`    | Run ESLint                                   |
| `npm run deploy`  | Build and deploy `dist/` to GitHub Pages     |

## Project Structure

```
src/
  components/   Shared, public/, and admin/ UI components
  pages/        Public pages and admin/ dashboard pages
  lib/          Supabase client, images, and shared config
  utils/        Helper utilities
supabase/
  schema.sql    Database tables, RLS policies, and RPC functions
```

See **[SETUP.md](SETUP.md)** for full setup and customization instructions.
