# header/ 結構說明（layout 導覽列）

這個目錄負責「頁面最上方的導覽列」相關元件，把視覺與邏輯拆開，方便後續維護與擴充。

- `HeaderBrand.tsx`  
  - 負責 vAcAnt Logo 圓形圖示與旁邊的品牌文字。  
  - 整塊是一個連到 `/` 的連結。

- `HeaderNav.tsx`  
  - 使用 `usePathname()` 判斷目前路由，產生「首頁 / 遊戲大廳 / 商店 / 錢包 / 個人中心」的主選單。  
  - 負責 active 樣式與霓虹底線。

- `HeaderWalletSummary.tsx`  
  - 顯示錢包摘要，目前是固定文案 `0 vAcAnt Coins` 作為占位。  
  - 之後 Phase 3 可以改成從錢包狀態或 Supabase 抓真實餘額。

- `HeaderUserMenu.tsx`  
  - 使用 `authStore` 取得目前使用者狀態。  
  - 顯示 Avatar、暱稱、副標（訪客模式 / email），以及「登入 / 登出」按鈕。  
  - 登入按鈕會開啟 `AuthModal`，登出按鈕呼叫 `signOut()`。

> 外層的 `MainHeader.tsx` 只負責排版（左：Brand+Nav，右：Wallet+UserMenu），不處理細節邏輯。

