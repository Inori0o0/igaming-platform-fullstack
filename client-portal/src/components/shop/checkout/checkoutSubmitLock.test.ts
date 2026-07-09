/**
 * P1 #5：結帳送出鎖要能撐過「元件記憶體被重置」的情境（整頁 reload、bfcache 還原
 * 後的重新掛載），不能只靠 useRef/useState。這裡直接測試 sessionStorage 鎖的
 * 讀寫邏輯，以及 `pageshow` 事件（bfcache 還原時 event.persisted === true）
 * 是否會用鎖的最新狀態通知呼叫端。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isCheckoutSubmitLocked,
  setCheckoutSubmitLocked,
  subscribeCheckoutPageShow,
} from "./checkoutSubmitLock";

function createFakeSessionStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("checkout submit lock（sessionStorage）", () => {
  let listeners: Array<(event: { persisted: boolean }) => void>;

  beforeEach(() => {
    listeners = [];
    vi.stubGlobal("window", {
      sessionStorage: createFakeSessionStorage(),
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        if (type === "pageshow") listeners.push(handler);
      },
      removeEventListener: (
        type: string,
        handler: (event: unknown) => void,
      ) => {
        if (type !== "pageshow") return;
        listeners = listeners.filter((l) => l !== handler);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("預設未鎖定", () => {
    expect(isCheckoutSubmitLocked()).toBe(false);
  });

  it("setCheckoutSubmitLocked(true) 之後會回報鎖定，直到再次解鎖", () => {
    setCheckoutSubmitLocked(true);
    expect(isCheckoutSubmitLocked()).toBe(true);

    setCheckoutSubmitLocked(false);
    expect(isCheckoutSubmitLocked()).toBe(false);
  });

  it("bfcache 還原（event.persisted=true）時，以目前鎖狀態通知呼叫端", () => {
    setCheckoutSubmitLocked(true);
    const onRestore = vi.fn();
    subscribeCheckoutPageShow(onRestore);

    expect(listeners).toHaveLength(1);
    listeners[0]?.({ persisted: true });

    expect(onRestore).toHaveBeenCalledWith(true);
  });

  it("非 bfcache 的一般 pageshow（event.persisted=false）不會觸發通知", () => {
    setCheckoutSubmitLocked(true);
    const onRestore = vi.fn();
    subscribeCheckoutPageShow(onRestore);

    listeners[0]?.({ persisted: false });

    expect(onRestore).not.toHaveBeenCalled();
  });

  it("unsubscribe 之後不再收到通知", () => {
    const onRestore = vi.fn();
    const unsubscribe = subscribeCheckoutPageShow(onRestore);
    unsubscribe();

    expect(listeners).toHaveLength(0);
  });
});
