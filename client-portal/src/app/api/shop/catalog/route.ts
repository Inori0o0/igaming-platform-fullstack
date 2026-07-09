import { NextResponse } from "next/server";
import { loadShopCatalogForApp } from "@/src/shop/fetchShopCatalog";

export async function GET() {
  const { products, source } = await loadShopCatalogForApp();
  return NextResponse.json({ products, source });
}
