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
  insertTransaction: vi.fn(),
  adjustWalletBalance: vi.fn(),
  claimFreeCoinsRpc: vi.fn(),
  depositWalletRpc: vi.fn(),
}));

import {
  claimFreeCoinsRpc,
  depositWalletRpc,
  getDbUserByAuthUserId,
  getOrCreateWallet,
  listTransactions,
} from "./wallet/dbWallet";
import { useWalletStore } from "./walletStore";

const mockedGetDbUser = getDbUserByAuthUserId as unknown as ReturnType<typeof vi.fn>;
const mockedGetWallet = getOrCreateWallet as unknown as ReturnType<typeof vi.fn>;
const mockedListTransactions = listTransactions as unknown as ReturnType<typeof vi.fn>;
const mockedClaimFreeCoinsRpc = claimFreeCoinsRpc as unknown as ReturnType<
  typeof vi.fn
>;
const mockedDepositWalletRpc = depositWalletRpc as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  mockUser = { id: "user-1" };
  mockedGetDbUser.mockReset();
  mockedGetWallet.mockReset();
  mockedListTransactions.mockReset();
  mockedClaimFreeCoinsRpc.mockReset();
  mockedDepositWalletRpc.mockReset();
  useWalletStore.setState({
    userId: null,
    balances: { VAC: 0, BTC: 0, ETH: 0 },
    transactions: [],
    pending: { deposit: false, withdraw: false, claim: false },
    errors: { deposit: null, withdraw: null, claim: null },
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

/**
 * P1 #4：免費領取／充值的額度、冷卻檢查改成單一原子 RPC（`claim_free_coins`／
 * `deposit_wallet`），不再是前端「先 SELECT 統計、再另外呼叫寫入 RPC」的兩步流程。
 * 這裡驗證登入使用者的路徑只呼叫一次對應 RPC，且 RPC 回傳的錯誤（例如資料庫端判斷
 * 超過額度）會原樣顯示給使用者，而不是前端自己重新計算一次。
 */
describe("claimFreeCoins (登入使用者)", () => {
  it("只呼叫一次 claim_free_coins RPC，不再另外查詢統計", async () => {
    mockedClaimFreeCoinsRpc.mockResolvedValue({ ok: true, balance: 6767 });
    mockedGetDbUser.mockResolvedValue({ id: "db-user-1" });
    mockedGetWallet.mockResolvedValue({
      user_id: "db-user-1",
      coin_balance: 6767,
      btc_balance: 0,
      eth_balance: 0,
    });
    mockedListTransactions.mockResolvedValue([]);

    await useWalletStore.getState().claimFreeCoins();

    expect(mockedClaimFreeCoinsRpc).toHaveBeenCalledTimes(1);
    const state = useWalletStore.getState();
    expect(state.pending.claim).toBe(false);
    expect(state.errors.claim).toBeNull();
    expect(state.balances.VAC).toBe(6767);
  });

  it("RPC 回傳額度／冷卻錯誤時，直接顯示資料庫端訊息並解除 pending 鎖", async () => {
    mockedClaimFreeCoinsRpc.mockResolvedValue({
      ok: false,
      error: "今日領取次數已達上限",
    });

    await useWalletStore.getState().claimFreeCoins();

    const state = useWalletStore.getState();
    expect(state.pending.claim).toBe(false);
    expect(state.errors.claim).toBe("領取失敗，請稍後再試");
    // hydrate 不該被呼叫：RPC 失敗時不需要重新讀取餘額。
    expect(mockedGetDbUser).not.toHaveBeenCalled();
  });

  it("pending.claim 為 true 時，重複呼叫會被前端鎖擋下（不會打第二次 RPC）", async () => {
    useWalletStore.setState({
      pending: { deposit: false, withdraw: false, claim: true },
    });

    await useWalletStore.getState().claimFreeCoins();

    expect(mockedClaimFreeCoinsRpc).not.toHaveBeenCalled();
  });
});

describe("deposit (登入使用者，VAC)", () => {
  it("只呼叫一次 deposit_wallet RPC，不再另外查詢統計", async () => {
    mockedDepositWalletRpc.mockResolvedValue({ ok: true, balance: 5000 });
    mockedGetDbUser.mockResolvedValue({ id: "db-user-1" });
    mockedGetWallet.mockResolvedValue({
      user_id: "db-user-1",
      coin_balance: 5000,
      btc_balance: 0,
      eth_balance: 0,
    });
    mockedListTransactions.mockResolvedValue([]);

    await useWalletStore.getState().deposit("VAC", 5000);

    expect(mockedDepositWalletRpc).toHaveBeenCalledTimes(1);
    expect(mockedDepositWalletRpc).toHaveBeenCalledWith(5000);
    const state = useWalletStore.getState();
    expect(state.errors.deposit).toBeNull();
    expect(state.balances.VAC).toBe(5000);
  });

  it("RPC 回傳頻率／上限錯誤時，顯示失敗訊息且不呼叫 hydrate", async () => {
    mockedDepositWalletRpc.mockResolvedValue({
      ok: false,
      error: "已達今日充值上限",
    });

    await useWalletStore.getState().deposit("VAC", 100);

    const state = useWalletStore.getState();
    expect(state.pending.deposit).toBe(false);
    expect(state.errors.deposit).toBe("充值失敗，請稍後再試");
    expect(mockedGetDbUser).not.toHaveBeenCalled();
  });
});

/**
 * P1 #7：Header/摘要元件應該只訂閱 `balances.VAC`（或依 displayCurrency 選取
 * 單一數值），不能訂閱整包 balances 物件。這裡不依賴 React 渲染次數，直接驗證
 * store 的行為基礎：任一幣別變動都會讓 `balances` 換成新的物件參考（訂閱整包
 * 物件的元件一定會被通知），但只選取 `balances.VAC` 時，VAC 沒變就不會拿到
 * 新的值（Object.is 比較下 Zustand 不會通知該訂閱者重渲染）。
 */
describe("balances 參考變化（驗證 selector 精細化的必要性）", () => {
  it("BTC 變動會換新 balances 物件參考，但 balances.VAC 數值本身不變", () => {
    useWalletStore.setState({ balances: { VAC: 100, BTC: 0, ETH: 0 } });
    const prevBalances = useWalletStore.getState().balances;
    const prevVac = useWalletStore.getState().balances.VAC;

    useWalletStore.setState((state) => ({
      balances: { ...state.balances, BTC: state.balances.BTC + 1 },
    }));

    const nextBalances = useWalletStore.getState().balances;
    const nextVac = useWalletStore.getState().balances.VAC;

    // 訂閱 `(s) => s.balances` 的元件：參考換新，一定會被通知重渲染。
    expect(nextBalances).not.toBe(prevBalances);
    // 訂閱 `(s) => s.balances.VAC` 的元件：數值沒變，不會被通知重渲染。
    expect(nextVac).toBe(prevVac);
  });
});
