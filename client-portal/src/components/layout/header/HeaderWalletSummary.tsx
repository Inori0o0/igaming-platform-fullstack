import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";

export function HeaderWalletSummary() {
  const userId = useAuthStore((s) => s.user?.id);
  const balances = useWalletStore((s) => s.balances);
  const displayCurrency = useWalletStore((s) => s.displayCurrency);
  const hydrateForCurrentUser = useWalletStore((s) => s.hydrateForCurrentUser);

  useEffect(() => {
    // Header 可能早於 wallet 頁掛載，這裡主動 hydrate 以保持摘要同步。
    hydrateForCurrentUser();
  }, [hydrateForCurrentUser, userId]);

  const currencyLabel =
    displayCurrency === "VAC" ? "vAcAnt Coins" : displayCurrency;
  const amount = balances[displayCurrency].toLocaleString(undefined, {
    maximumFractionDigits: displayCurrency === "VAC" ? 0 : 6,
  });

  return (
    <div className="hidden flex-col items-end text-xs text-neutral-300 sm:flex">
      <span className="font-medium text-cyan-200">
        {amount} {currencyLabel}
      </span>
      <span className="text-[10px] text-neutral-500">
        Wallet · Display {currencyLabel}
      </span>
    </div>
  );
}
