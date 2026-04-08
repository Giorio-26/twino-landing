import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/config";
import { cn } from "@/lib/utils";
import { LOCALES } from "../constants";
import { useClickOutside } from "../hooks";

export default function LangToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      router.replace(pathname, { locale: newLocale });
      setOpen(false);
    },
    [router, pathname],
  );

  const current = LOCALES.find((l) => l.code === locale)!;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-primary/70 text-sm transition-all duration-250 ease-out",
          "hover:bg-accent/5 hover:text-primary",
          open && "bg-accent/5 text-primary",
        )}
      >
        {/* <Globe className="size-4" /> */}
        <span className="font-semibold text-xs uppercase tracking-wide">
          {current.label}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-300 ease-in-out",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute top-full right-0 mt-2 min-w-full origin-top-right overflow-hidden rounded-xl border border-black/5 bg-white shadow-black/5 shadow-lg",
          "transition-all duration-250 ease-in-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "-translate-y-1.5 pointer-events-none scale-95 opacity-0",
        )}
      >
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchLocale(l.code)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-sm transition-colors duration-200 ease-out",
              "hover:bg-accent/5",
              l.code === locale
                ? "font-semibold text-accent"
                : "text-primary/65",
            )}
          >
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
