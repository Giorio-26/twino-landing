import { defineRouting } from "next-intl/routing";
import { locales } from "@/lib/config";

export const routing = defineRouting({
  locales,
  defaultLocale: "ka",
  localePrefix: "always",
  localeDetection: false,
  localeCookie: false,
});
