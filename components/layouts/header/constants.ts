import type { Locale } from "@/lib/config";

export const NAV_LINKS = [
  { labelKey: "header.features", href: "#features" },
  { labelKey: "header.howItWorks", href: "#how-it-works" },
  { labelKey: "header.contact", href: "#contact" },
] as const;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ka", label: "GE" },
];
