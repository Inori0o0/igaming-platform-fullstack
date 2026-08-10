import { supabase } from "@/src/lib/supabaseClient";
import { parseBalanceRpcResult } from "@shared/supabase/json";
import type { Tables, TablesInsert } from "@shared/database.types";
import { toNumber } from "./numberUtils";
import type {
  AdjustWalletBalanceResult,
  TransactionType,
  WalletTransaction,
} from "./types";

type DbUserRow = Pick<Tables<"users">, "id" | "auth_user_id">;
type DbWalletRow = Pick<
  Tables<"wallets">,
  "user_id" | "coin_balance" | "btc_balance" | "eth_balance"
>;

export async function getDbUserByAuthUserId(
  authUserId: string,
): Promise<DbUserRow> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_user_id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) {
    throw new Error("找不到對應的資料庫使用者，請確認 SQL trigger 已生效。");
  }

  return data;
}

export async function getOrCreateWallet(
  dbUserId: string,
): Promise<DbWalletRow> {
  const { data, error } = await supabase
    .from("wallets")
    .select("user_id, coin_balance, btc_balance, eth_balance")
    .eq("user_id", dbUserId)
    .maybeSingle();

  if (error) {
    throw new Error("讀取錢包失敗");
  }

  if (data) {
    return data;
  }

  // phase-7：前端已無法直接 INSERT wallets（見 adjust_wallet_balance 遷移）。
  // 一般帳號的錢包列由 handle_new_auth_user trigger 在註冊時建立；
  // 這裡呼叫 ensure_wallet() RPC 作為安全網（例如遷移前就存在的舊帳號）。
  const { data: ensured, error: ensureError } = await supabase.rpc(
    "ensure_wallet",
  );

  if (ensureError || !ensured) {
    throw new Error("建立錢包失敗");
  }

  return {
    user_id: ensured.user_id,
    coin_balance: ensured.coin_balance,
    btc_balance: ensured.btc_balance,
    eth_balance: ensured.eth_balance,
  };
}

export async function listTransactions(
  dbUserId: string,
): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, currency, amount, description, created_at, status, balance_after",
    )
    .eq("user_id", dbUserId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    throw new Error("讀取交易紀錄失敗");
  }

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at ?? "",
    type: row.type as TransactionType,
    currency: row.currency as WalletTransaction["currency"],
    amount: toNumber(row.amount),
    status:
      row.status === "pending" || row.status === "failed"
        ? row.status
        : "completed",
    description: row.description ?? "",
    balanceAfter:
      row.balance_after === null ? null : toNumber(row.balance_after),
  }));
}

export async function insertTransaction(params: {
  dbUserId: string;
  type: TransactionType;
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  balanceAfter: number | null;
  gameId?: string;
  themeId?: string;
  roundId?: string;
  metadata?: Record<string, unknown>;
}) {
  // 目前僅 withdraw（提領申請，pending，不影響餘額）還會走這條路徑；
  // 會異動餘額的交易一律改走 adjust_wallet_balance() RPC（見下方 adjustWalletBalance）。
  const payload: TablesInsert<"transactions"> = {
    user_id: params.dbUserId,
    type: params.type,
    currency: "VAC",
    amount: params.amount,
    status: params.status,
    description: params.description,
    balance_after: params.balanceAfter,
    game_id: params.gameId ?? null,
    theme_id: params.themeId ?? null,
    round_id: params.roundId ?? null,
    metadata: (params.metadata as TablesInsert<"transactions">["metadata"]) ?? null,
  };
  const { error } = await supabase.from("transactions").insert(payload);

  if (error) {
    throw new Error("寫入交易紀錄失敗");
  }
}

/**
 * phase-7：唯一可異動已登入使用者 coin_balance 的入口。
 * 呼叫 Postgres `adjust_wallet_balance` RPC（SECURITY DEFINER），由資料庫以
 * 「UPDATE ... WHERE coin_balance + delta >= 0」單一原子陳述式完成「檢查餘額 + 寫入」，
 * 前端不再能（也不再需要）直接 UPDATE wallets，避免 read-modify-write 競態與 Console 竄改。
 */
export async function adjustWalletBalance(params: {
  delta: number;
  type: TransactionType;
  description: string;
  gameId?: string;
  themeId?: string;
  roundId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AdjustWalletBalanceResult> {
  const { data, error } = await supabase.rpc("adjust_wallet_balance", {
    p_delta: params.delta,
    p_type: params.type,
    p_description: params.description,
    p_game_id: params.gameId,
    p_theme_id: params.themeId,
    p_round_id: params.roundId,
    p_metadata: params.metadata as TablesInsert<"transactions">["metadata"],
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const balance = parseBalanceRpcResult(data);
  if (balance === null) {
    return { ok: false, error: "錢包回傳格式異常" };
  }
  return { ok: true, balance };
}

/**
 * P1 #4：修正 TOCTOU 空窗。免費領取的「今日次數／冷卻檢查」與「餘額寫入」
 * 過去分成前端兩次 SELECT + 一次 RPC，中間有空窗可被併發請求繞過。
 * 現在整個檢查與寫入都在 `claim_free_coins` RPC 內、同一筆資料庫交易、鎖列後完成，
 * 前端不再需要（也不再能）自己做額度判斷。
 */
export async function claimFreeCoinsRpc(): Promise<AdjustWalletBalanceResult> {
  const { data, error } = await supabase.rpc("claim_free_coins");

  if (error) {
    return { ok: false, error: error.message };
  }

  const balance = parseBalanceRpcResult(data);
  if (balance === null) {
    return { ok: false, error: "錢包回傳格式異常" };
  }
  return { ok: true, balance };
}

/**
 * P1 #4：充值版本的同一修正。每分鐘次數／每日金額上限的檢查與加值，
 * 全部在 `deposit_wallet` RPC 內鎖列後原子完成。
 */
export async function depositWalletRpc(
  amount: number,
): Promise<AdjustWalletBalanceResult> {
  const { data, error } = await supabase.rpc("deposit_wallet", {
    p_amount: amount,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const balance = parseBalanceRpcResult(data);
  if (balance === null) {
    return { ok: false, error: "錢包回傳格式異常" };
  }
  return { ok: true, balance };
}
