-- Phase 6.x: User avatars upload (storage bucket + RLS)
--
-- Purpose:
-- - Support uploading a custom user avatar to Supabase Storage
-- - Update `public.users.avatar_url` with the public object URL
--
-- Client behavior (client-portal):
-- - bucket: `user-avatars`
-- - object path: `<auth_user_id>/<uuid>-<filename>`
-- - read: public via `/storage/v1/object/public/...`
--
-- Prerequisites:
-- - docs/sql/phase-3-wallet-vac-migration.sql (public.users + users_select_own/users_update_own RLS)
-- - docs/sql/phase-6-shop-orders-migration.sql (profile shop-avatar selection tables)

-- 1) Storage bucket
insert into storage.buckets (id, name, public)
values ('user-avatars', 'user-avatars', true)
on conflict (id) do update set public = excluded.public;

-- 2) Public read
drop policy if exists user_avatars_public_read on storage.objects;
create policy user_avatars_public_read on storage.objects
for select
to public
using (bucket_id = 'user-avatars');

-- 3) Authenticated write restriction:
--    allow insert/update/delete only for objects whose first folder matches auth.uid()
drop policy if exists user_avatars_insert_own on storage.objects;
create policy user_avatars_insert_own on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists user_avatars_update_own on storage.objects;
create policy user_avatars_update_own on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'user-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists user_avatars_delete_own on storage.objects;
create policy user_avatars_delete_own on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

