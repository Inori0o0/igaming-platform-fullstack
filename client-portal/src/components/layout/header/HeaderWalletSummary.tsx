import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";
import { formatAmount } from "@/src/components/wallet/format";

export function HeaderWalletSummary() {
  const userId = useAuthStore((s) => s.user?.id);
  const balances = useWalletStore((s) => s.balances);
  const displayCurrency = useWalletStore((s) => s.displayCurrency);
  const hydrateForCurrentUser = useWalletStore((s) => s.hydrateForCurrentUser);
  const hydrateStatus = useWalletStore((s) => s.hydrateStatus);

  useEffect(() => {
    // Header 可能早於 wallet 頁掛載，這裡主動 hydrate 以保持摘要同步。
    hydrateForCurrentUser();
  }, [hydrateForCurrentUser, userId]);

  const currencyLabel =
    displayCurrency === "VAC" ? "vAcAnt Coins" : displayCurrency;
  const amount = formatAmount(displayCurrency, balances[displayCurrency]);
  // hydrate 失敗時 balances 仍是上一次成功讀到的值（不會被蓋成 0），
  // 但顯示上要讓使用者知道「這可能不是最新餘額」，而不是誤以為錢真的變成這個數字。
  const hasHydrateError = hydrateStatus === "error";

  return (
    <div className="hidden flex-col items-end text-xs text-neutral-300 sm:flex">
      <span
        className={hasHydrateError ? "font-medium text-amber-300" : "font-medium text-cyan-200"}
        title={hasHydrateError ? "餘額讀取失敗，顯示的可能不是最新資料" : undefined}
      >
        {amount} {currencyLabel}
        {hasHydrateError ? " ⚠" : ""}
      </span>
      {hasHydrateError ? (
        <button
          type="button"
          onClick={() => hydrateForCurrentUser()}
          className="text-[10px] text-amber-300/90 underline-offset-2 hover:underline"
        >
          餘額讀取失敗，點擊重試
        </button>
      ) : (
        <span className="text-[10px] text-neutral-500">
          Wallet · Display {currencyLabel}
        </span>
      )}
    </div>
  );
}
