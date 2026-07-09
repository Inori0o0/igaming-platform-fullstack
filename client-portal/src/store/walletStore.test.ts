/**
 * hydrateForCurrentUser 失敗時不能把 balances 蓋成 0（P0 bug）：
 * - 成功讀取後要進入 hydrateStatus "ready"，balances 反映最新資料。
 * - Supabase 讀取失敗時要保留上一次成功讀到的 balances/transactions，
 *   只把 hydrateStatus 設成 "error" 並附上錯誤訊息，讓 UI 顯示「讀取失敗」而不是假的 0。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

let mockUser: { id: string; is_guest?: true } | null = null;

vi.mock("./wallet/localWallet", () => ({
  buildStorageKey: (id: string) => `key:${id}`,
  createTransaction: (p: Record<string, unknown>) => ({
    id: "tx",
    createdAt: "now",
    ...p,
  }),
  getCurrentGuestId: () => null,
  getCurrentUser: () => mockUser,
  getLocalClaimStats: () => ({ todayCount: 0, lastClaimAtMs: null }),
  getLocalDepositStats: () => ({ minuteCount: 0, todayAmount: 0 }),
  loadLocalWallet: () => ({
    balances: { VAC: 0, BTC: 0, ETH: 0 },
    transactions: [],
  }),
  persistLocalWallet: () => {},
}));

vi.mock("./wallet/dbWallet", () => ({
  getDbUserByAuthUserId: vi.fn(),
  getOrCreateWallet: vi.fn(),
  listTransactions: vi.fn(),
  getDbClaimStats: vi.fn(),
  getDbDepositStats: vi.fn(),
  insertTransaction: vi.fn(),
  adjustWalletBalance: vi.fn(),
}));

import {
  getDbUserByAuthUserId,
  getOrCreateWallet,
  listTransactions,
} from "./wallet/dbWallet";
import { useWalletStore } from "./walletStore";

const mockedGetDbUser = getDbUserByAuthUserId as unknown as ReturnType<typeof vi.fn>;
const mockedGetWallet = getOrCreateWallet as unknown as ReturnType<typeof vi.fn>;
const mockedListTransactions = listTransactions as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockUser = { id: "user-1" };
  mockedGetDbUser.mockReset();
  mockedGetWallet.mockReset();
  mockedListTransactions.mockReset();
  useWalletStore.setState({
    userId: null,
    balances: { VAC: 0, BTC: 0, ETH: 0 },
    transactions: [],
    hydrateStatus: "idle",
    hydrateError: null,
  });
});

describe("hydrateForCurrentUser", () => {
  it("sets hydrateStatus to ready and loads balances on success", async () => {
    mockedGetDbUser.mockResolvedValue({ id: "db-user-1" });
    mockedGetWallet.mockResolvedValue({
      user_id: "db-user-1",
      coin_balance: 12345,
      btc_balance: 0,
      eth_balance: 0,
    });
    mockedListTransactions.mockResolvedValue([]);

    await useWalletStore.getState().hydrateForCurrentUser();

    const state = useWalletStore.getState();
    expect(state.hydrateStatus).toBe("ready");
    expect(state.hydrateError).toBeNull();
    expect(state.balances.VAC).toBe(12345);
  });

  it("keeps the previously loaded balances (does not zero them out) when hydrate fails", async () => {
    // 先成功讀到一次真實餘額。
    mockedGetDbUser.mockResolvedValueOnce({ id: "db-user-1" });
    mockedGetWallet.mockResolvedValueOnce({
      user_id: "db-user-1",
      coin_balance: 9999,
      btc_balance: 1,
      eth_balance: 2,
    });
    mockedListTransactions.mockResolvedValueOnce([]);
    await useWalletStore.getState().hydrateForCurrentUser();
    expect(useWalletStore.getState().balances.VAC).toBe(9999);

    // 下一次 hydrate（例如分頁切回前景重新讀取）失敗。
    mockedGetDbUser.mockRejectedValueOnce(new Error("network down"));
    await useWalletStore.getState().hydrateForCurrentUser();

    const state = useWalletStore.getState();
    expect(state.balances.VAC).toBe(9999); // 不能被蓋成 0
    expect(state.hydrateStatus).toBe("error");
    expect(state.hydrateError).toBeTruthy();
  });

  it("sets hydrateStatus to ready with default balances when there is no user", async () => {
    mockUser = null;
    await useWalletStore.getState().hydrateForCurrentUser();
    const state = useWalletStore.getState();
    expect(state.hydrateStatus).toBe("ready");
    expect(state.balances).toEqual({ VAC: 0, BTC: 0, ETH: 0 });
  });
});
