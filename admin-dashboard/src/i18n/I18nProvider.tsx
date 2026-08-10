import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  createTranslator,
  DEFAULT_LOCALE,
  localeToBcp47,
  type Locale,
  type Translator,
} from "@shared/i18n";

type I18nContextValue = {
  locale: Locale;
  t: Translator;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** 目前固定 zh-TW；語言切換 UI 之後再接，先不讀 localStorage 避免殘留 en。 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = DEFAULT_LOCALE;

  useEffect(() => {
    document.documentElement.lang = localeToBcp47(locale);
    try {
      window.localStorage.removeItem("vacant.admin.locale");
    } catch {
      // ignore
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: createTranslator(locale),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT(): Translator {
  return useI18n().t;
}
