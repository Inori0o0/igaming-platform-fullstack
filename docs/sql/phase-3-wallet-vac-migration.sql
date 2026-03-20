-- Phase 3 wallet migration (VAC-first + real persistence)
-- Apply this in Supabase SQL Editor before using DB-backed wallet store.

create extension if not exists "pgcrypto";

-- 1) transaction_type: add claim
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'transaction_type'
      and e.enumlabel = 'claim'
  ) then
    alter type transaction_type add value 'claim';
  end if;
end
$$;

-- 2) one wallet per user
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wallets_user_id_key'
  ) then
    alter table public.wallets
      add constraint wallets_user_id_key unique (user_id);
  end if;
end
$$;

-- 3) transactions status + balance_after
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'status'
  ) then
    alter table public.transactions
      add column status text not null default 'completed';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'balance_after'
  ) then
    alter table public.transactions
      add column balance_after numeric(18, 2);
  end if;
end
$$;

-- enforce valid status values
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_status_check'
  ) then
    alter table public.transactions
      add constraint transactions_status_check
      check (status in ('pending', 'completed', 'failed'));
  end if;
end
$$;

-- 4) VAC-only currency for now
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_currency_vac_check'
  ) then
    alter table public.transactions
      add constraint transactions_currency_vac_check
      check (currency = 'VAC');
  end if;
end
$$;

-- 5) helper trigger: wallets.updated_at auto refresh
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wallets_touch_updated_at on public.wallets;
create trigger trg_wallets_touch_updated_at
before update on public.wallets
for each row execute function public.touch_updated_at();

-- 6) RLS
alter table public.users enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists wallets_select_own on public.wallets;
create policy wallets_select_own on public.wallets
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = wallets.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists wallets_insert_own on public.wallets;
create policy wallets_insert_own on public.wallets
for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.id = wallets.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists wallets_update_own on public.wallets;
create policy wallets_update_own on public.wallets
for update
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = wallets.user_id
      and u.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = wallets.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own on public.transactions
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = transactions.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own on public.transactions
for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.id = transactions.user_id
      and u.auth_user_id = auth.uid()
  )
);
