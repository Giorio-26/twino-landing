"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Hamburger from "./components/hamburger";
import LangToggle from "./components/lang-toggle";
import MobileMenu from "./components/mobile-menu";
import Nav from "./components/nav";
import {
  useBodyScrollLock,
  useCloseOnResize,
  useScrolled,
  useSmoothScroll,
} from "./hooks";

export default function Header() {
  const t = useTranslations("common");
  const headerRef = useRef<HTMLElement>(null);

  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  useBodyScrollLock(mobileOpen);
  useCloseOnResize(
    1024,
    useCallback(() => setMobileOpen(false), []),
  );

  const scrollTo = useSmoothScroll(headerRef);

  const handleNavigate = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      scrollTo(e, href);
      setMobileOpen(false);
    },
    [scrollTo],
  );

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-all duration-350 ease-out",
          scrolled
            ? "bg-white/75 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_12px_rgba(51,100,163,0.1)] backdrop-blur-xl backdrop-saturate-180"
            : "bg-transparent",
        )}
      >
        <div className="container">
          <div className="flex h-18 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="relative z-10 shrink-0 transition-opacity duration-200 ease-out hover:opacity-80"
            >
              <Image
                src="/images/twino.svg"
                alt={t("name")}
                width={120}
                height={32}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <Nav onNavigate={handleNavigate} />

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 lg:flex">
              <LangToggle />

              <Link
                href="#book-demo"
                onClick={(e) => handleNavigate(e, "#book-demo")}
                className="group hover:-translate-y-0.5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 font-semibold text-sm text-white no-underline transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,114,255,0.2)]"
              >
                {t("header.bookDemo")}
                <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <Hamburger
              open={mobileOpen}
              onToggle={() => setMobileOpen((prev) => !prev)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}
