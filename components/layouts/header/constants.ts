import type { Locale } from "@/lib/config";

export const NAV_LINKS = [
  { labelKey: "header.product", href: "#product" },
  { labelKey: "header.howItWorks", href: "#how-it-works" },
  { labelKey: "header.pricing", href: "#why-twino" },
  { labelKey: "header.contact", href: "#book-demo" },
] as const;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ka", label: "GE" },
];
