# श्री सिद्धिविनायक गणेश मंदिर, चिमठाणे — Temple platform

React + Vite + Supabase, deployable on Vercel. The app runs without Supabase (shows a "not connected" message instead of crashing).

## Setup
1. Create a project at supabase.com. Open **SQL Editor**, paste `supabase/schema.sql`, run. (The last lines insert DEMO members/Aarti — delete them from /admin.)
2. **Authentication → Users → Add user** (email + password). Then run in SQL Editor: `update profiles set role='admin' where email='you@example.com';`
3. `cp .env.example .env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API). Use the **anon** key only; never the service-role key.
4. `npm install && npm run dev`

## Deploy (Vercel)
Push to GitHub → import in Vercel → add the two env variables → Deploy. `vercel.json` handles page refresh routing.

## Using it
- **/admin** → sign in → add members, then add Aarti (member, date, time). One Aarti per date is enforced; reschedule by changing the date.
- Events/announcements: insert rows in Supabase **Table Editor** (`events`, `announcements`) until their admin forms are built.
- Today's Aarti uses India time (Asia/Kolkata), not the visitor's device clock. Phone numbers are admin-only (RLS); the public site reads the `public_aarti` view (names only).

## Not built yet
Gallery + Storage upload, community-message form and moderation UI (tables and RLS already exist), admin forms for events/announcements, calendar grid, About/Contact pages, Daily Darshan, temple_info/site_settings tables, Web Push reminders (needs a service worker + push subscription table + scheduled Edge Function; browsers only notify after the user grants permission), PWA icons/service worker.
