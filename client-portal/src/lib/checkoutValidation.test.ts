/**
 * P1 #6：結帳表單的 schema 驗證。
 * - 單欄位驗證（`validateShippingField`）要能在使用者輸入當下就給出錯誤訊息。
 * - 整份驗證（`validateShippingForm`）在送出前擋下不合法的表單，且每個欄位
 *   最多回報一則訊息（給 UI 顯示用）。
 */
import { describe, expect, it } from "vitest";
import {
  validateShippingField,
  validateShippingForm,
} from "./checkoutValidation";

describe("validateShippingField", () => {
  it("收件人為空白時回報錯誤", () => {
    expect(validateShippingField("recipient", "   ")).toBe("請填寫收件人姓名");
  });

  it("收件人有值時通過", () => {
    expect(validateShippingField("recipient", "王小明")).toBeNull();
  });

  it("手機號碼格式不正確時回報錯誤", () => {
    expect(validateShippingField("phone", "abc")).toBe("手機號碼格式不正確");
  });

  it("手機號碼格式正確時通過", () => {
    expect(validateShippingField("phone", "0912-345-678")).toBeNull();
  });

  it("地址為空白時回報錯誤", () => {
    expect(validateShippingField("address", "")).toBe("請填寫完整地址");
  });

  it("備註是選填欄位，空字串應通過", () => {
    expect(validateShippingField("note", "")).toBeNull();
  });

  it("備註超過長度上限時回報錯誤", () => {
    expect(validateShippingField("note", "a".repeat(201))).toBe(
      "備註過長（上限 200 字）",
    );
  });
});

describe("validateShippingForm", () => {
  it("合法表單回傳空物件（沒有任何欄位錯誤）", () => {
    const errors = validateShippingForm({
      recipient: "王小明",
      phone: "0912345678",
      address: "台北市信義區松高路 1 號",
      note: "",
    });
    expect(errors).toEqual({});
  });

  it("同時回報多個欄位各自的錯誤訊息", () => {
    const errors = validateShippingForm({
      recipient: "",
      phone: "",
      address: "",
      note: "",
    });
    expect(errors.recipient).toBe("請填寫收件人姓名");
    expect(errors.phone).toBe("請填寫手機號碼");
    expect(errors.address).toBe("請填寫完整地址");
    expect(errors.note).toBeUndefined();
  });
});
