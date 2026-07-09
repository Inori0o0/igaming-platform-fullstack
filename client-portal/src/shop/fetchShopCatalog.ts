import { supabase } from "@/src/lib/supabaseClient";
import { getProductById, shopProducts as mockShopProducts } from "@/src/shop/products";
import type { ApparelSize, Product } from "@/src/shop/types";
import { apparelSizes } from "@/src/shop/types";

type VariantRow = {
  id: string;
  size: string | null;
  stock_quantity: number | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  fulfillment_type: string;
  is_avatar: boolean | null;
  image_bucket: string | null;
  image_object_path: string;
  price_vac: number | string;
  force_sold_out: boolean | null;
  sort_order: number | null;
  product_variants: VariantRow[] | null;
};

function publicImageUrl(bucket: string, objectPath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "/products/vacant_tee.webp";
  const safePath = objectPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${safePath}`;
}

function sortSizes(sizes: string[]): ApparelSize[] {
  const order = new Map(apparelSizes.map((s, i) => [s, i]));
  return [...sizes].sort((a, b) => (order.get(a as ApparelSize) ?? 99) - (order.get(b as ApparelSize) ?? 99)) as ApparelSize[];
}

export function mapProductRow(row: ProductRow): Product | null {
  if (!row.slug || !row.image_object_path) return null;
  const category = row.category as Product["category"];
  if (!["apparel", "digital", "collectible"].includes(category)) return null;

  const variants = row.product_variants ?? [];
  const sizedVariants = variants.filter((v) => v.size != null && v.size !== "");
  const uniqueSizes = [...new Set(sizedVariants.map((v) => v.size as string))];
  const sizeOptions: readonly ApparelSize[] | undefined =
    uniqueSizes.length > 0 ? sortSizes(uniqueSizes) : undefined;

  const forceOut = Boolean(row.force_sold_out);
  const stockBySize: Partial<Record<ApparelSize, number>> = {};
  for (const v of sizedVariants) {
    const label = v.size as string;
    if (!apparelSizes.includes(label as ApparelSize)) continue;
    const qty = Number(v.stock_quantity) || 0;
    stockBySize[label as ApparelSize] = forceOut ? 0 : qty;
  }

  const stockSum = variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
  const stock = forceOut ? 0 : stockSum;

  const bucket = row.image_bucket?.trim() || "shop-products";

  return {
    id: row.slug,
    dbProductId: row.id,
    name: row.name,
    priceVac: Number(row.price_vac),
    category,
    fulfillmentType: row.fulfillment_type === "digital" ? "digital" : "physical",
    isAvatar: Boolean(row.is_avatar),
    sizeOptions,
    stockBySize: Object.keys(stockBySize).length > 0 ? stockBySize : undefined,
    imageSrc: publicImageUrl(bucket, row.image_object_path),
    description: row.description ?? "",
    stock,
  };
}

/** `source: "mock"` 代表這批資料其實是離線示範內容（Supabase 查詢失敗或空表），呼叫端必須把這個狀態
 * 往上傳給 UI，不能讓使用者在完全不知情的狀況下瀏覽/加購假資料（原本的行為是靜默 fallback）。 */
export type ShopCatalogResult = {
  products: Product[];
  source: "live" | "mock";
};

export type ProductLookupResult = {
  product: Product | null;
  source: "live" | "mock";
};

const PRODUCT_SELECT = `
  id,
  slug,
  name,
  description,
  category,
  fulfillment_type,
  is_avatar,
  image_bucket,
  image_object_path,
  price_vac,
  force_sold_out,
  sort_order,
  product_variants (
    id,
    size,
    stock_quantity
  )
`;

export async function loadShopCatalogForApp(): Promise<ShopCatalogResult> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[shop] supabase products query failed:", error.message);
      return { products: mockShopProducts, source: "mock" };
    }

    const rows = (data ?? []) as ProductRow[];
    const mapped = rows
      .map((row) => mapProductRow(row))
      .filter((p): p is Product => p != null);

    if (mapped.length === 0) {
      return { products: mockShopProducts, source: "mock" };
    }
    return { products: mapped, source: "live" };
  } catch (e) {
    console.warn("[shop] loadShopCatalogForApp error:", e);
    return { products: mockShopProducts, source: "mock" };
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductLookupResult> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.warn("[shop] fetchProductBySlug failed:", error.message);
      return { product: getProductById(slug) ?? null, source: "mock" };
    }

    if (!data) {
      return { product: getProductById(slug) ?? null, source: "mock" };
    }

    const mapped = mapProductRow(data as ProductRow);
    if (!mapped) {
      return { product: getProductById(slug) ?? null, source: "mock" };
    }
    return { product: mapped, source: "live" };
  } catch (e) {
    console.warn("[shop] fetchProductBySlug error:", e);
    return { product: getProductById(slug) ?? null, source: "mock" };
  }
}
