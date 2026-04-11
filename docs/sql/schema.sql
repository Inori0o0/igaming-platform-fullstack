-- Reference snapshot of public schema (NOT a runnable migration).
-- Synced from Supabase project "first-igaming-project" (ref fjduloefmqtohtnkqtfp) via MCP on 2026-04-11.
-- Table order is for human reading; constraints may require auth schema to exist.

-- Enums
CREATE TYPE public.coupon_discount_type AS ENUM ('percentage', 'fixed', 'free_shipping');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM (
  'deposit',
  'withdraw',
  'bet',
  'win',
  'purchase',
  'claim',
  'wager',
  'payout'
);

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  email text UNIQUE,
  display_name text,
  avatar_url text,
  is_guest boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  banned_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users (id)
);

CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  coin_balance numeric DEFAULT 0,
  btc_balance numeric DEFAULT 0,
  eth_balance numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id)
);

CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.transaction_type NOT NULL,
  currency text NOT NULL CHECK (currency = 'VAC'::text),
  amount numeric NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'completed'::text CHECK (
    status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])
  ),
  balance_after numeric,
  game_id text,
  theme_id text,
  round_id uuid,
  metadata jsonb,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id)
);

CREATE TABLE public.game_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  bet_amount numeric DEFAULT 0,
  win_amount numeric DEFAULT 0,
  result jsonb,
  played_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_history_pkey PRIMARY KEY (id),
  CONSTRAINT game_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id)
);

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_type text NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id)
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text,
  image_url text,
  stock integer,
  is_active boolean DEFAULT true,
  slug text,
  fulfillment_type text,
  is_avatar boolean DEFAULT false,
  image_bucket text DEFAULT 'shop-products'::text,
  image_object_path text,
  price_vac numeric,
  force_sold_out boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  size text CHECK (
    size IS NULL
    OR (size = ANY (ARRAY['XS'::text, 'S'::text, 'M'::text, 'L'::text, 'XL'::text]))
  ),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id)
);

CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  discount_type public.coupon_discount_type NOT NULL,
  discount_value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  applies_fulfillment text NOT NULL DEFAULT 'any'::text CHECK (
    applies_fulfillment = ANY (ARRAY['physical'::text, 'digital'::text, 'any'::text])
  ),
  title text NOT NULL DEFAULT ''::text,
  internal_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  status public.order_status DEFAULT 'pending'::public.order_status,
  shipping_info jsonb,
  created_at timestamp with time zone DEFAULT now(),
  fulfillment_type text,
  subtotal_vac numeric,
  shipping_fee_vac numeric DEFAULT 0,
  discount_vac numeric DEFAULT 0,
  total_vac numeric,
  coupon_code text,
  shipping_snapshot jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id)
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price_at_purchase numeric NOT NULL,
  variant_id uuid,
  unit_price_vac numeric,
  line_total_vac numeric,
  size_snapshot text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants (id)
);

CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id),
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id)
);

CREATE TABLE public.user_entitlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  entitlement_type text NOT NULL CHECK (
    entitlement_type = ANY (ARRAY['avatar'::text, 'digital_item'::text])
  ),
  source_order_id uuid,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_entitlements_pkey PRIMARY KEY (id),
  CONSTRAINT user_entitlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id),
  CONSTRAINT user_entitlements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id),
  CONSTRAINT user_entitlements_source_order_id_fkey FOREIGN KEY (source_order_id) REFERENCES public.orders (id)
);

CREATE TABLE public.user_avatar_selection (
  user_id uuid NOT NULL,
  avatar_product_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_avatar_selection_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_avatar_selection_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id),
  CONSTRAINT user_avatar_selection_avatar_product_id_fkey FOREIGN KEY (avatar_product_id) REFERENCES public.products (id)
);

-- Notable indexes (partial / business rules); see live DB for full list.
-- UNIQUE (user_id, achievement_type) ON achievements
-- UNIQUE (user_id, product_id) ON user_entitlements
-- UNIQUE (user_id, product_id) ON wishlists
-- UNIQUE (code) ON coupons WHERE deleted_at IS NULL
-- UNIQUE (product_id, size) ON product_variants WHERE size IS NOT NULL; UNIQUE (product_id) WHERE size IS NULL
-- UNIQUE (slug) ON products WHERE slug IS NOT NULL
