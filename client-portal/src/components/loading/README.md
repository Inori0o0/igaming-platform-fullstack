# Loading（載入元件）

此資料夾放專案內可重用的載入 UI。品牌 Logo／霓虹相關元件也集中在這裡；共用圖標在 `components/branding/LogoMark.tsx`。

## 檔案一覽

| 檔案 | 角色 |
|------|------|
| `NeonLogoWrapper.tsx` | Framer 進／退場 + 霓虹脈動；包住 `LogoMark` 等子節點。 |
| `SplashScreen.tsx` | 對外 API：`show`、`minVisibleMs`、`mode` → 內部 `useSplashVisibility` + `SplashScreenView`。 |
| `SplashScreenView.tsx` | 純畫面（全螢幕 `fixed` 或區塊內 `absolute` + `LogoMark` 文案）。 |
| `useSplashVisibility.ts` | `show` 為 true 立刻顯示；改 false 時至少再顯示 `minVisibleMs` 再關，避免閃一下。 |
| `LogoLoader.tsx` | 行內小圖示：`size` `xs` \| `sm` \| `md` 對應到底層 `LogoMark` 的 `sm` 或 `md`（`xs`/`sm` 皆為 `sm`）。**目前 repo 內未引用**。 |
| `ImageLoadingShimmer.tsx` | 圖片載入中的覆蓋 shimmer。需放在 `relative` 容器內，通常和 `next/image` 的 `onLoad` / `onError` 一起用。 |
| `LoadingImage.tsx` | `next/image` 的共用包裝：內建 shimmer、淡入與 error 收斂。若只是一般圖片 loading，優先用這個。 |

## `NeonLogoWrapper` Props

- `show?`（預設 `true`）：控制子樹是否掛載與退場動畫。
- `durationIn?` / `durationOut?`：進／退秒數（預設 `0.5` / `0.3`）。
- `className?`：外層 `motion.div`。

## `SplashScreen` Props

- `show?`：是否要求顯示（例如 `authStore.isLoading`）。
- `minVisibleMs?`（預設 `600`）：最短露出時間。
- `mode?`：`"fullscreen"`（`fixed inset-0`）或 `"inline"`（`absolute inset-0`，**父層須 `relative`**）。

## 專案內掛載點

1. **`ClientLayoutShell.tsx`**：`SplashScreen show={isAuthLoading} mode="fullscreen"` — Auth 初始化全螢幕。
2. **`app/(lobby)/shop/loading.tsx`** → `ShopPageSplashLoading`：`SplashScreen show minVisibleMs={400} mode="inline"`，只蓋 `main` 內商品區，側欄／頂欄保留。
3. **`games/baccarat/components/BaccaratTableClient.tsx`**：`SplashScreen show={!isReady} mode="inline"` — JS bundle 下載完成且桌布圖片載入後關閉。
4. **`games/blackjack/components/BlackjackTableClient.tsx`**：同上，等桌布圖片載入。
5. **`games/slots/components/SlotThemedPlayfieldClient.tsx`**：同上，等主題背景圖片載入。

`(lobby)/layout.tsx` 僅包一層 `ClientLayoutShell`；首頁沒有另外的 loading 文案，與全站相同靠上述 Splash。

## 遊戲載入架構說明

遊戲的 loading 已從 **route 層（`loading.tsx` Suspense boundary）** 移至 **component 層**：

```
*TableClient / *PlayfieldClient  （relative min-h-[62vh]）
  ├── SplashScreen mode="inline" show={!isReady}   ← 覆蓋整個遊戲區
  └── dynamic(() => GameComponent)
        └── useEffect: 預載背景圖 → onLoad/onError/timeout → onReady()
```

- `isReady` 初始為 `false`，SplashScreen **立刻可見**，覆蓋 JS bundle 下載與圖片網路請求兩個階段。
- 主要圖片載入完成（或 3 秒 fallback）後呼叫 `onReady()`，SplashScreen 經 `minVisibleMs=400` 後淡出。
- 原 `loading.tsx` 因只能攔截 Server Component Suspense（不含圖片階段），且 Baccarat/Blackjack 頁面為同步元件永遠不觸發，已全數移除。

## 何時用哪個

- **全站 Auth 或整頁開場** → `SplashScreen`（已接在 shell；其他頁若要短開場可再掛）。
- **僅主內容區、要留導覽** → 同上元件 `mode="inline"` + 外層 `relative`（見商店 `loading`、遊戲 Client）。
- **按鈕、表單旁小 loader** → `LogoLoader`（自選接入）。
- **圖片尚未載入完成** → 優先用 `LoadingImage`；若只需要單獨覆蓋層，再用 `ImageLoadingShimmer`。
