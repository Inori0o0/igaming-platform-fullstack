import { createTranslator, type Locale, type Translator } from "../i18n";
import { Constants, type Enums } from "../database.types";

export type DbTransactionType = Enums<"transaction_type">;
export type TransactionStatus = "completed" | "pending" | "failed";

/** Types used by the player wallet UI (subset of DB enum). */
export const WALLET_TRANSACTION_TYPES = [
  "deposit",
  "withdraw",
  "claim",
  "wager",
  "payout",
  "purchase",
] as const satisfies readonly DbTransactionType[];

export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];

export const ALL_TRANSACTION_TYPES = Constants.public.Enums.transaction_type;

export const TRANSACTION_STATUSES = [
  "completed",
  "pending",
  "failed",
] as const satisfies readonly TransactionStatus[];

const TYPE_MESSAGE_KEY = {
  deposit: "transaction.type.deposit",
  withdraw: "transaction.type.withdraw",
  claim: "transaction.type.claim",
  wager: "transaction.type.wager",
  payout: "transaction.type.payout",
  purchase: "transaction.type.purchase",
  bet: "transaction.type.bet",
  win: "transaction.type.win",
} as const satisfies Record<DbTransactionType, `transaction.type.${string}`>;

const STATUS_MESSAGE_KEY = {
  completed: "transaction.status.completed",
  pending: "transaction.status.pending",
  failed: "transaction.status.failed",
} as const satisfies Record<TransactionStatus, `transaction.status.${string}`>;

export function transactionTypeLabel(
  type: string,
  tOrLocale: Translator | Locale = "zh-TW",
): string {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  if (type in TYPE_MESSAGE_KEY) {
    return t(TYPE_MESSAGE_KEY[type as DbTransactionType]);
  }
  return type;
}

export function transactionStatusLabel(
  status: string,
  tOrLocale: Translator | Locale = "zh-TW",
): string {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  if (status in STATUS_MESSAGE_KEY) {
    return t(STATUS_MESSAGE_KEY[status as TransactionStatus]);
  }
  return status;
}

/** Build select options for wallet / admin filters from the shared catalog. */
export function transactionTypeFilterOptions(
  tOrLocale: Translator | Locale = "zh-TW",
  types: readonly DbTransactionType[] = WALLET_TRANSACTION_TYPES,
): { value: string; label: string }[] {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  return [
    { value: "", label: t("common.allTypes") },
    ...types.map((type) => ({
      value: type,
      label: transactionTypeLabel(type, t),
    })),
  ];
}

export function transactionStatusFilterOptions(
  tOrLocale: Translator | Locale = "zh-TW",
): { value: string; label: string }[] {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  return [
    { value: "", label: t("common.allStatuses") },
    ...TRANSACTION_STATUSES.map((status) => ({
      value: status,
      label: transactionStatusLabel(status, t),
    })),
  ];
}

/** Convenience map for table cells that still prefer Record lookups. */
export function transactionTypeLabels(
  tOrLocale: Translator | Locale = "zh-TW",
): Record<WalletTransactionType, string> {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  return {
    deposit: t("transaction.type.deposit"),
    withdraw: t("transaction.type.withdraw"),
    claim: t("transaction.type.claim"),
    wager: t("transaction.type.wager"),
    payout: t("transaction.type.payout"),
    purchase: t("transaction.type.purchase"),
  };
}

export function transactionStatusLabels(
  tOrLocale: Translator | Locale = "zh-TW",
): Record<TransactionStatus, string> {
  const t =
    typeof tOrLocale === "function" ? tOrLocale : createTranslator(tOrLocale);
  return {
    completed: t("transaction.status.completed"),
    pending: t("transaction.status.pending"),
    failed: t("transaction.status.failed"),
  };
}
