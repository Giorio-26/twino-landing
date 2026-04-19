import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = {
    common: (await import(`./messages/${locale}/common.json`)).default,
    dashboard: (await import(`./messages/${locale}/dashboard.json`)).default,
  };

  return {
    locale,
    messages,
    timeZone: "Asia/Tbilisi",
  };
});
