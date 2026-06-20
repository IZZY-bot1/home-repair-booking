# FixRight Home Repair — Setup Guide

## 1. Configure Environment Variables

Edit `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Project Settings → API**

---

## 2. Set Up the Database

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates:
- All 6 tables with correct schema
- RLS policies (public insert-only on appointments, public read on services/hours/settings)
- The `get_appointment_slots_for_date` RPC function for availability checking
- Sample services, business hours, and settings

---

## 3. Create an Admin User

**Step 1 — Create user in Supabase Auth:**
- Go to **Authentication → Users → Add user**
- Enter an email and password
- Click **Create user**
- Copy the user's **UUID** from the users list

**Step 2 — Grant admin access:**
- Go to **SQL Editor**
- Run:

```sql
INSERT INTO admin_users (user_id) VALUES ('PASTE-UUID-HERE');
```

Replace `PASTE-UUID-HERE` with the UUID you copied.

---

## 4. Run the App

```bash
npm run dev
```

- Public website: http://localhost:5173
- Admin dashboard: http://localhost:5173/admin

---

## Customization

| What to change | Where |
|---|---|
| Images | `src/lib/images.ts` |
| Business details | Admin Dashboard → Settings |
| Services | Admin Dashboard → Services |
| Business hours | Admin Dashboard → Business Hours |
| Block dates | Admin Dashboard → Blocked Dates |

---

## Features

**Public Website:**
- Premium hero section with home repair imagery
- Dynamic services loaded from Supabase
- About section with trust signals
- 4-step booking wizard (service → date/time → details → confirmation)
- Smart availability: respects business hours, blocked dates, existing bookings, and notice time
- Booking inserts without reading back (secure, follows RLS rules)

**Admin Dashboard:**
- Secure login with Supabase Auth + admin_users verification
- Overview with appointment stats
- Full appointments table with status updates
- Services management (add, edit, activate/deactivate)
- Business hours editor (per-day open/close + time range)
- Blocked dates management
- Business settings (name, email, phone, address, slot interval, notice period)
