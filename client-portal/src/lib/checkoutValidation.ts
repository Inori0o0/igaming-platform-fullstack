/**
 * P1 #6：結帳表單的 schema 驗證。
 * 之前只在送出時做「trim 後是否為空字串」的簡單檢查，沒有逐欄位即時反饋，
 * 也沒有格式驗證（例如手機號碼隨便打幾個字都會過）。這裡改用 zod 定義單一
 * schema，同時支援「單欄位即時驗證」（onChange/onBlur）與「送出前整份驗證」，
 * 避免兩處驗證邏輯各自維護、彼此漏改。
 */
import { z } from "zod";
import type { ShippingForm } from "@/src/components/shop/checkout/useCheckoutViewModel";

const PHONE_PATTERN = /^[0-9+\-() ]{6,20}$/;

export const shippingFormSchema = z.object({
  recipient: z
    .string()
    .trim()
    .min(1, "請填寫收件人姓名")
    .max(40, "收件人姓名過長（上限 40 字）"),
  phone: z
    .string()
    .trim()
    .min(1, "請填寫手機號碼")
    .regex(PHONE_PATTERN, "手機號碼格式不正確"),
  address: z
    .string()
    .trim()
    .min(1, "請填寫完整地址")
    .max(200, "地址過長（上限 200 字）"),
  note: z.string().trim().max(200, "備註過長（上限 200 字）").optional(),
});

export type ShippingFieldName = keyof typeof shippingFormSchema.shape;
export type ShippingFieldErrors = Partial<Record<ShippingFieldName, string>>;

/** 單欄位即時驗證：輸入當下就能看到該欄位的錯誤，不用等送出。 */
export function validateShippingField(
  field: ShippingFieldName,
  value: string,
): string | null {
  const fieldSchema = shippingFormSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "格式不正確";
}

/** 送出前的整份驗證：回傳每個欄位的錯誤訊息（沒有錯誤的欄位不會出現在物件中）。 */
export function validateShippingForm(
  form: ShippingForm,
): ShippingFieldErrors {
  const result = shippingFormSchema.safeParse(form);
  if (result.success) return {};

  const errors: ShippingFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ShippingFieldName | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
