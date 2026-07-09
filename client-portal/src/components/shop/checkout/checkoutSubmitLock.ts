/**
 * P1 #5：結帳送出鎖的「頁面層」防護。
 *
 * 原本的鎖（`confirmLockRef` + `uiState.isSubmitting`）只存在於單次元件實例的
 * 記憶體中：一旦頁面被瀏覽器丟棄重建（例如整頁重新載入、或前進/後退造成的
 * document 重新掛載），元件會用全新的 ref/state 重新掛載，鎖就歸零了 —— 使用者
 * 有機會在同一筆訂單還在處理中、或剛送出成功時，再次觸發一次送出。
 *
 * sessionStorage 綁定同一個分頁（tab），會在整頁 reload 或前進/後退之間存活，
 * 因此拿來當作 ref/state 之外的第二層鎖：即使元件記憶體被重置，送出前都會先
 * 檢查這個旗標，只有旗標未鎖定時才允許送出。搭配 `pageshow` 事件（會在瀏覽器
 * bfcache 還原頁面時觸發，`event.persisted === true`）可以在還原的瞬間重新
 * 同步 UI 狀態，避免畫面看起來「可以送出」但鎖其實還在。
 */

const STORAGE_KEY = "checkout:submit-lock";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    // Safari 隱私模式等環境可能直接擋掉 sessionStorage 存取。
    return null;
  }
}

export function isCheckoutSubmitLocked(): boolean {
  return getSessionStorage()?.getItem(STORAGE_KEY) === "1";
}

export function setCheckoutSubmitLocked(locked: boolean): void {
  const storage = getSessionStorage();
  if (!storage) return;
  if (locked) {
    storage.setItem(STORAGE_KEY, "1");
  } else {
    storage.removeItem(STORAGE_KEY);
  }
}

/**
 * 註冊 bfcache 還原監聽：頁面從 bfcache 恢復時，以 sessionStorage 目前的鎖
 * 狀態為準重新同步一次，回呼由呼叫端決定要怎麼更新自己的 UI 狀態。
 */
export function subscribeCheckoutPageShow(
  onRestore: (locked: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: PageTransitionEvent) => {
    if (!event.persisted) return;
    onRestore(isCheckoutSubmitLocked());
  };

  window.addEventListener("pageshow", handler);
  return () => window.removeEventListener("pageshow", handler);
}
