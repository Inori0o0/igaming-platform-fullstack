-- Phase 4 (stub): slot theme availability — NOT applied by default.
-- See docs/sql/README.md for other migration file names and order.
-- When the admin backend is ready, run a migration similar to below and
-- replace the static map in client-portal/src/games/slots/config/gameAvailability.ts
-- with a Supabase/API fetch (or read replica).

-- Example shape (adjust names/constraints to your conventions):

-- create table if not exists public.slot_theme_availability (
--   theme_id text primary key,
--   status text not null check (status in ('open', 'maintenance', 'coming_soon')),
--   updated_at timestamptz not null default now()
-- );

-- insert into public.slot_theme_availability (theme_id, status) values
--   ('italian-brainrot', 'open'),
--   ('vacant-classic', 'open'),
--   ('cyber-neon', 'maintenance')
-- on conflict (theme_id) do update set
--   status = excluded.status,
--   updated_at = now();

-- RLS: admin/service role writes; authenticated or anon reads as needed.
