/**
 * `shopCatalogStore` 不能在使用者不知情的狀況下悄悄顯示假的商品目錄（P0 bug）：
 * - API 回應帶 source: "live" 時，catalogSource 要是 "live"。
 * - 即使 HTTP 200，只要 API 回應標示 source: "mock"（伺服器內部已經 fallback），
 *   catalogSource 也要跟著標成 "mock"，不能因為 fetchState 是 "ok" 就被誤判為正常資料。
 * - fetch 本身失敗時，catalogSource 要標成 "mock"，讓 UI 能顯示警示。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { shopProducts } from "@/src/shop/products";
import { useShopCatalogStore } from "./shopCatalogStore";

function resetStore() {
  useShopCatalogStore.setState({
    products: shopProducts,
    fetchState: "idle",
    catalogSource: "mock",
  });
}

beforeEach(() => {
  resetStore();
  vi.restoreAllMocks();
});

describe("hydrateFromApi", () => {
  it("marks catalogSource as live when the API reports live data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: shopProducts, source: "live" }),
      }),
    );

    await useShopCatalogStore.getState().hydrateFromApi();

    const state = useShopCatalogStore.getState();
    expect(state.fetchState).toBe("ok");
    expect(state.catalogSource).toBe("live");
  });

  it("marks catalogSource as mock even on HTTP 200 if the API says source is mock", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: shopProducts, source: "mock" }),
      }),
    );

    await useShopCatalogStore.getState().hydrateFromApi();

    const state = useShopCatalogStore.getState();
    expect(state.fetchState).toBe("ok");
    expect(state.catalogSource).toBe("mock");
  });

  it("marks catalogSource as mock when the fetch itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await useShopCatalogStore.getState().hydrateFromApi();

    const state = useShopCatalogStore.getState();
    expect(state.fetchState).toBe("error");
    expect(state.catalogSource).toBe("mock");
  });
});

describe("seedFromServer", () => {
  it("records the source passed in by the server-rendered page", () => {
    useShopCatalogStore.getState().seedFromServer(shopProducts, "mock");

    const state = useShopCatalogStore.getState();
    expect(state.fetchState).toBe("ok");
    expect(state.catalogSource).toBe("mock");
  });

  it("does not overwrite an already-seeded catalog", () => {
    useShopCatalogStore.getState().seedFromServer(shopProducts, "live");
    useShopCatalogStore.getState().seedFromServer([], "mock");

    expect(useShopCatalogStore.getState().catalogSource).toBe("live");
  });
});
