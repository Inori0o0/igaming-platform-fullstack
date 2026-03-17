# sidebar/ 結構說明（賭場大廳側邊欄）

這個目錄負責「左側大廳 Sidebar」的細部元件，用來呈現遊戲 / 商店 / 帳號相關的導覽與 Brainrot 區塊。

- `SidebarSection.tsx`  
  - 用來渲染單一區塊，例如「Casino / Shop / Account」。  
  - Props：
    - `title`: 區塊標題文字。
    - `items`: `{ href, label }[]` 導覽項目。  
    - `pathname`: 目前路由字串，用來決定 active 狀態。
  - 負責：
    - 顯示區塊標題（小字、全部大寫）。  
    - 逐一渲染 Link，並在 active 時加上霓虹底色與右側光條。

- `SidebarBrainrotBanner.tsx`  
  - 放在 Sidebar 最底部的 Brainrot 宣傳區塊。  
  - 目前顯示占位文字，說明未來會放 Italian Brainrot 角色小海報或活動 Banner。  
  - 之後可以改成顯示圖片、CTA 按鈕或輪播，而不用改 `MainSidebar.tsx`。

> 外層的 `MainSidebar.tsx` 只負責：決定有哪些 sections（`sections` 設定）、把 `pathname` 傳給每個 `SidebarSection`，以及在底部插入 `SidebarBrainrotBanner`。

