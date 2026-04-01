export interface DbUser {
  id: string
  auth_user_id: string | null
  email: string | null
  display_name: string | null
  avatar_url: string | null
  is_guest: boolean
  created_at: string
}

export interface DbWallet {
  id: string
  user_id: string
  coin_balance: number
  btc_balance: number
  eth_balance: number
  updated_at: string
}

export interface DbTransaction {
  id: string
  user_id: string
  type: string
  currency: string
  amount: number
  description: string | null
  created_at: string
  status: 'pending' | 'completed' | 'failed'
  balance_after: number | null
  game_id: string | null
  theme_id: string | null
  round_id: string | null
  metadata: Record<string, unknown> | null
}

export interface DbGameHistory {
  id: string
  user_id: string
  game_type: string
  bet_amount: number
  win_amount: number
  result: Record<string, unknown> | null
  played_at: string
}

export interface DbProduct {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  stock: number | null
  is_active: boolean
  slug: string | null
  fulfillment_type: string | null
  is_avatar: boolean
  image_bucket: string
  image_object_path: string | null
  price_vac: number | null
  force_sold_out: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DbProductVariant {
  id: string
  product_id: string
  size: string | null
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface DbOrder {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  shipping_info: Record<string, unknown> | null
  created_at: string
  fulfillment_type: string | null
  subtotal_vac: number | null
  shipping_fee_vac: number | null
  discount_vac: number | null
  total_vac: number | null
  coupon_code: string | null
  shipping_snapshot: Record<string, unknown> | null
  updated_at: string
}

export interface DbOrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  variant_id: string | null
  unit_price_vac: number | null
  line_total_vac: number | null
  size_snapshot: string | null
  created_at: string
}

export interface DbCoupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number
  expires_at: string | null
  is_active: boolean
  applies_fulfillment: 'physical' | 'digital' | 'any'
  title: string
  internal_note: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AdminUser {
  id: string
  email: string
  role: string
}
