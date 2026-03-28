-- Phase 5 slots wallet settlement migration (wager + payout + round metadata)
-- Apply after docs/sql/phase-3-wallet-vac-migration.sql (and after
-- docs/sql/phase-0-schema-bootstrap.sql if you started from an empty database).

-- 1) transaction_type: add wager / payout
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'transaction_type'
      and e.enumlabel = 'wager'
  ) then
    alter type transaction_type add value 'wager';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'transaction_type'
      and e.enumlabel = 'payout'
  ) then
    alter type transaction_type add value 'payout';
  end if;
end
$$;

-- 2) transactions: round/game columns for slots reconciliation
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'game_id'
  ) then
    alter table public.transactions
      add column game_id text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'theme_id'
  ) then
    alter table public.transactions
      add column theme_id text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'round_id'
  ) then
    alter table public.transactions
      add column round_id uuid;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'metadata'
  ) then
    alter table public.transactions
      add column metadata jsonb;
  end if;
end
$$;

-- 3) helpful indexes for round reconciliation / history filters
create index if not exists idx_transactions_user_game_created
  on public.transactions (user_id, game_id, created_at desc);

create index if not exists idx_transactions_round_id
  on public.transactions (round_id);

create index if not exists idx_transactions_theme_id
  on public.transactions (theme_id);
