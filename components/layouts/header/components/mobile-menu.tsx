import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/config";
import { cn } from "@/lib/utils";
import { LOCALES, NAV_LINKS } from "../constants";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function MobileMenu({
  open,
  onClose,
  onNavigate,
}: MobileMenuProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      router.replace(pathname, { locale: newLocale });
      onClose();
    },
    [router, pathname, onClose],
  );

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onNavigate(e, href);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/15 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-18 right-0 left-0 z-40 border-black/5 border-b bg-white/97 py-6 backdrop-blur-xl lg:hidden",
          "transition-all duration-300 ease-in-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "-translate-y-3 pointer-events-none opacity-0",
        )}
      >
        <div className="container">
          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="flex items-center rounded-xl px-4 py-3.5 font-Helvetica-Neue font-medium text-base text-primary/75 no-underline transition-all duration-200 ease-out hover:bg-accent/5 hover:text-accent"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-4 h-px bg-black/5" />

          {/* Language Switcher */}
          <div className="mb-4 flex items-center gap-2 px-4">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border-none px-4 py-2.5 font-medium text-sm transition-all duration-250 ease-out",
                  l.code === locale
                    ? "bg-accent/10 text-accent"
                    : "bg-black/4 text-primary/60 hover:bg-black/8 hover:opacity-80",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="px-4">
            <Link
              href="#book-demo"
              onClick={(e) => handleNav(e, "#book-demo")}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-sm text-white no-underline transition-transform duration-200 ease-out active:scale-[0.98]"
            >
              {t("header.bookDemo")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
