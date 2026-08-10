# shared

前後台共用的型別、文案與小工具（避免 client-portal / admin-dashboard 各寫一份）。

放在 `client-portal/shared`（而非 repo 根目錄），因為 Next.js Turbopack 不能解析 app 根目錄外的模組；admin-dashboard 透過 alias 指向這裡。

| 路徑 | 用途 |
|------|------|
| `database.types.ts` | Supabase generated `Database` 型別（綁定 `createClient<Database>`） |
| `i18n/` | 輕量翻譯目錄與 `createTranslator`（預設 `zh-TW`，可切 `en`） |
| `labels/transaction.ts` | 交易類型／狀態顯示標籤（前後台共用） |
| `supabase/json.ts` | RPC `Json` 回傳的窄化／解析 helper |

匯入：`import { … } from "@shared/i18n"`（兩邊 tsconfig / bundler alias 皆為 `@shared`）。

重新產生 DB 型別：

```bash
# 需先 `npx supabase login` 或設定 SUPABASE_ACCESS_TOKEN
npm run gen:types   # 在 client-portal 或 admin-dashboard 目錄執行
```
