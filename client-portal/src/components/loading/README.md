# Loading（品牌載入）

此資料夾只放 **vAcAnt Logo／霓虹** 相關的載入 UI；共用圖標在 `components/branding/LogoMark.tsx`。

## 檔案一覽

| 檔案 | 角色 |
|------|------|
| `NeonLogoWrapper.tsx` | Framer 進／退場 + 霓虹脈動；包住 `LogoMark` 等子節點。 |
| `SplashScreen.tsx` | 對外 API：`show`、`minVisibleMs`、`mode` → 內部 `useSplashVisibility` + `SplashScreenView`。 |
| `SplashScreenView.tsx` | 純畫面（全螢幕 `fixed` 或區塊內 `absolute` + `LogoMark` 文案）。 |
| `useSplashVisibility.ts` | `show` 為 true 立刻顯示；改 false 時至少再顯示 `minVisibleMs` 再關，避免閃一下。 |
| `GameLoadingScreen.tsx` | 區塊用：標題「正在載入 {gameName}」+ 可選 `tip`；**目前 repo 內未引用**，需要時在頁面 `isLoading` 使用。 |
| `LogoLoader.tsx` | 行內小圖示：`size` `xs` \| `sm` \| `md` 對應到底層 `LogoMark` 的 `sm` 或 `md`（`xs`/`sm` 皆為 `sm`）。**目前 repo 內未引用**。 |

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

`(lobby)/layout.tsx` 僅包一層 `ClientLayoutShell`；首頁沒有另外的 loading 文案，與全站相同靠上述 Splash。

## 何時用哪個

- **全站 Auth 或整頁開場** → `SplashScreen`（已接在 shell；其他頁若要短開場可再掛）。
- **僅主內容區、要留導覽** → 同上元件 `mode="inline"` + 外層 `relative`（見商店 `loading`）。
- **遊戲／大廳區塊載入** → `GameLoadingScreen`（自選接入）。
- **按鈕、表單旁小 loader** → `LogoLoader`（自選接入）。
