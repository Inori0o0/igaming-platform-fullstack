import type { Enums, Tables } from '@shared/database.types'

export type DbUser = Tables<'users'>
export type DbWallet = Tables<'wallets'>
export type DbTransaction = Tables<'transactions'>
export type DbGameHistory = Tables<'game_history'>
export type DbProduct = Tables<'products'>
export type DbProductVariant = Tables<'product_variants'>
export type DbOrder = Tables<'orders'>
export type DbOrderItem = Tables<'order_items'>
export type DbCoupon = Tables<'coupons'>

export type OrderStatus = Enums<'order_status'>
export type TransactionType = Enums<'transaction_type'>
export type CouponDiscountType = Enums<'coupon_discount_type'>

export interface AdminUser {
  id: string
  email: string
  role: string
}
