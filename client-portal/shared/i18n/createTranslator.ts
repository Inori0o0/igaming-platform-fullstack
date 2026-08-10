import { en } from "./messages/en";
import { zhTW } from "./messages/zh-TW";
import {
  DEFAULT_LOCALE,
  type Locale,
  type MessageCatalog,
  type MessageKey,
} from "./types";

const catalogs: Record<Locale, MessageCatalog> = {
  "zh-TW": zhTW,
  en,
};

function readPath(catalog: MessageCatalog, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = catalog;
  for (const part of parts) {
    if (cur === null || typeof cur !== "object" || !(part in cur)) {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function createTranslator(locale: Locale = DEFAULT_LOCALE) {
  const catalog = catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
  const fallback = catalogs[DEFAULT_LOCALE];

  return function t(key: MessageKey): string {
    return readPath(catalog, key) ?? readPath(fallback, key) ?? key;
  };
}

export type Translator = ReturnType<typeof createTranslator>;

export function localeToBcp47(locale: Locale): string {
  return locale === "zh-TW" ? "zh-TW" : "en-US";
}
