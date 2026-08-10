import type { en } from "./messages/en";
import type { zhTW } from "./messages/zh-TW";

export const LOCALES = ["zh-TW", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-TW";

export type MessageCatalog = typeof zhTW | typeof en;

/** Dot-path keys into the message catalog, e.g. `nav.slots`. */
export type MessageKey = LeavePaths<MessageCatalog>;

type LeavePaths<T, Prefix extends string = ""> = T extends string
  ? Prefix extends ""
    ? never
    : Prefix
  : {
      [K in keyof T & string]: LeavePaths<
        T[K],
        Prefix extends "" ? K : `${Prefix}.${K}`
      >;
    }[keyof T & string];
