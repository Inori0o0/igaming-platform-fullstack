export type ProfileOrderRow = {
  id: string;
  status: string;
  fulfillment_type: string;
  subtotal_vac: number | string;
  shipping_fee_vac: number | string;
  discount_vac: number | string;
  total_vac: number | string;
  coupon_code: string | null;
  created_at: string;
};

/** Supabase embed：單列或 PostgREST 推成單元素陣列 */
export type OrderDetailProductRow = {
  name: string | null;
  slug: string | null;
  image_bucket: string | null;
  image_object_path: string | null;
};

export type OrderDetailLineItem = {
  id: string;
  quantity: number;
  unit_price_vac: number | string;
  line_total_vac: number | string;
  size_snapshot: string | null;
  products: OrderDetailProductRow | OrderDetailProductRow[] | null;
};

export type OrderDetail = {
  id: string;
  status: string;
  fulfillment_type: string;
  subtotal_vac: number | string;
  shipping_fee_vac: number | string;
  discount_vac: number | string;
  total_vac: number | string;
  coupon_code: string | null;
  shipping_snapshot: Record<string, unknown> | null;
  created_at: string;
  order_items: OrderDetailLineItem[] | null;
};
