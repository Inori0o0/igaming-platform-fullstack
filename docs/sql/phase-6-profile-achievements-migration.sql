-- Phase 6.3: Profile achievements (RLS + uniqueness)
--
-- Purpose:
-- - Make `public.achievements` safe for client-side read/write by authenticated users
-- - Prevent duplicate unlock rows for the same (user_id, achievement_type)
--
-- Prerequisites:
-- - docs/sql/phase-0-schema-bootstrap.sql (creates public.achievements)
-- - docs/sql/phase-3-wallet-vac-migration.sql (public.users + auth.uid() mapping)

alter table public.achievements enable row level security;

-- One achievement type can only be unlocked once per user.
create unique index if not exists idx_achievements_user_type_unique
on public.achievements (user_id, achievement_type);

drop policy if exists achievements_select_own on public.achievements;
create policy achievements_select_own on public.achievements
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = achievements.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists achievements_insert_own on public.achievements;
create policy achievements_insert_own on public.achievements
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = achievements.user_id
      and u.auth_user_id = auth.uid()
  )
);
