## vAcAnt Loading 系統說明

這個資料夾集中管理所有與 **vAcAnt Logo 加載動畫** 有關的元件，方便在整個站內重複使用同一套品牌體驗。

---

### 1. 基礎積木

- **`LogoMark.tsx`**（在 `components/branding/`）
  - 包裝 `/public/logo.svg` 的共用 Logo 元件。
  - `size`: `"sm" | "md" | "lg" | "xl"` 控制尺寸。
  - 一般不直接加動畫，動畫交給下面的容器處理。

- **`NeonLogoWrapper.tsx`**
  - 統一處理 Logo 的進場 / 退場動畫與霓虹脈動。
  - Props：
    - `show?: boolean`：是否顯示。
    - `durationIn?: number`：進場時間（秒，預設 `0.5`）。
    - `durationOut?: number`：退場時間（秒，預設 `0.3`）。
    - `className?: string`：外層容器樣式。
  - 用法：
    ```tsx
    <NeonLogoWrapper>
      <LogoMark size="lg" />
    </NeonLogoWrapper>
    ```

---

### 2. 場景元件

- **`SplashScreen.tsx`**
  - 用途：網站「首次進站」的開場 Logo 動畫（偏全螢幕）。
  - Props：
    - `show?: boolean`：是否顯示，由呼叫端控制（例如 initAuth、頁面載入、按鈕觸發）。
    - `minVisibleMs?: number`：最短顯示時間（毫秒，預設 `600`），避免一閃而過。
    - `mode?: "fullscreen" | "inline"`：顯示模式；全螢幕或只覆蓋主內容區。
  - 特性：
    - 根據 `show` 狀態決定顯示與否，並保證至少顯示 `minVisibleMs` 時間。
    - `mode="fullscreen"`：進站時接近全螢幕顯示 Logo（初次進站用）。
    - `mode="inline"`：只覆蓋 `main` 內容區，保留 Sidebar / Header / Footer 在畫面上。

  > 目前專案策略：`SplashScreen` 主要用在「首次進站」；後續短暫同步/載入不再用整頁覆蓋，改用 `LogoLoader` 或頁面自己的 skeleton。

  **內部結構（已拆分，方便維護）：**

  - `SplashScreen.tsx`：對外 API（組裝元件）
  - `SplashScreenView.tsx`：純 UI 呈現（不管計時）
  - `useSplashVisibility.ts`：顯示/隱藏狀態機（處理 `minVisibleMs`、排程等）

- **`GameLoadingScreen.tsx`**
  - 用途：載入某個「遊戲」或「Lobby」時的 Logo Loading 畫面。
  - Props：
    - `gameName: string`：顯示「正在載入 {gameName} …」。
    - `tip?: string`：可選提示文字。
  - 範例（首頁已使用）：
    ```tsx
    if (isLoading) {
      return (
        <main className="flex min-h-[60vh] items-center justify-center">
          <GameLoadingScreen
            gameName="vAcAnt Lobby"
            tip="正在準備你的錢包與連線狀態…"
          />
        </main>
      );
    }
    ```

- **`LogoLoader.tsx`**
  - 用途：小型 inline Logo Loader，用在按鈕、卡片等局部載入狀態。
  - Props：
    - `size?: "xs" | "sm" | "md"`：Logo 尺寸（內部映射到 `LogoMark` 尺寸）。
    - `className?: string`：外層容器樣式。
  - 範例：
    ```tsx
    <Button disabled>
      <LogoLoader size="xs" className="mr-2" />
      處理中…
    </Button>
    ```

---

### 3. 掛載位置一覽

- **`ClientLayoutShell.tsx`**
  - 全站載入體驗的掛載點（主站殼）：
    - `SplashScreen`：
      - 第一次進站且 auth 初始化期間，以 `mode="fullscreen"` 顯示，形成開場動畫。
      - 為避免 hydration mismatch，loading 判斷會在 client mount 後才成立（目前抽在 `useInitialSplash()`）。
    - `LogoLoader`（右上角小提示）：
      - 後續若 auth 再次 loading，只顯示右上角小型「同步中…」提示，不覆蓋整頁內容。
  - 目前的路由結構是：Root `app/layout.tsx` 放 Provider，主站殼掛在 `app/(lobby)/layout.tsx`：
    ```tsx
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
    ```
    ```tsx
    // app/(lobby)/layout.tsx
    <ClientLayoutShell>{children}</ClientLayoutShell>
    ```

- **`app/(lobby)/page.tsx`**
  - 首頁在 Auth 狀態載入中時，目前以簡單文字顯示「正在準備你的連線與錢包狀態…」。
  - 首次進站的主要 loading 視覺仍由 `ClientLayoutShell` 的 `SplashScreen` 提供。

---

### 4. 什麼時候該用哪一個？

- **進站一次性的開場動畫** → 用 `SplashScreen`（已全域掛好，通常不需改動）。
- **載入某個遊戲或大廳頁面** → 在該頁 `isLoading` 狀態時用 `GameLoadingScreen`（未來遊戲頁面可自行接入）。
- **按鈕、卡片局部載入** → 用 `LogoLoader` 當作小型 Loader 圖示。

---

### 5. Hook（狀態判斷）

- **`useInitialSplash.ts`**
  - 用途：集中管理「首次進站 Splash」與「後續 inline 同步提示」的判斷邏輯（含 `sessionStorage` 記錄）。
  - 原則：避免 SSR/CSR 初始 render 不一致造成 hydration mismatch，因此判斷會在 client mount 後才生效。

- **`useSplashVisibility.ts`**
  - 用途：提供 `SplashScreen` 的可見性狀態機（立刻可見 + `minVisibleMs` 防閃爍）。
  - 白話：你只要負責控制 `show`，其餘「顯示多久、何時關掉」交給這個 hook。

