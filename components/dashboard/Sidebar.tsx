"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cog,
  LogOut,
  MessageSquare,
  Plug,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("dashboard.sidebar");
  const [collapsed, setCollapsed] = useState(false);

  type NavItem = {
    label: string;
    href: string;
    icon: typeof BarChart3;
    badge?: number | null;
    section?: "operations" | "setup" | "system";
  };

  const navItems: NavItem[] = [
    { label: t("nav.overview"), href: "/dashboard", icon: BarChart3, section: "operations" },
    { label: t("nav.pipeline"), href: "/dashboard/leads", icon: Users, section: "operations" },
    { label: t("nav.conversations"), href: "/dashboard/conversations", icon: MessageSquare, badge: null, section: "operations" },
    { label: t("nav.twinSetup"), href: "/dashboard/configure", icon: Cog, section: "setup" },
    { label: t("nav.integration"), href: "/dashboard/integration", icon: Plug, section: "setup" },
    { label: t("nav.settings"), href: "/dashboard/settings", icon: Settings, section: "system" },
  ];

  const sections: { key: string; label: string; items: NavItem[] }[] = [
    { key: "operations", label: t("sections.workspace"), items: navItems.filter((i) => i.section === "operations") },
    { key: "setup", label: t("sections.setup"), items: navItems.filter((i) => i.section === "setup") },
    { key: "system", label: t("sections.system"), items: navItems.filter((i) => i.section === "system") },
  ];

  const handleLogout = async () => {
    await fetch("/api/dashboard/sign-out", { method: "POST" });
    router.push("/dashboard/access");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside
      className={`group/sidebar relative flex h-screen flex-col border-black/5 border-r bg-white transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-[260px]"}`}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-black/5 border-b px-5">
        {collapsed ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-sm text-white shadow-accent/20 shadow-md">
            T
          </div>
        ) : (
          <Image
            src="/images/twino.svg"
            alt={t("name")}
            width={120}
            height={32}
            priority
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {sections.map((section) => {
            if (section.items.length === 0) return null;
            return (
              <div key={section.key}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 font-Helvetica-Neue font-semibold text-[10px] uppercase tracking-wider text-dash-text-muted">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm no-underline transition-all duration-200 ${active ? "bg-accent-light text-accent" : "text-primary/50 hover:bg-accent-secondary-light hover:text-primary"}`}
                      >
                        {active && (
                          <div className="-translate-y-1/2 absolute top-1/2 left-0 h-5 w-0.75 rounded-r-full bg-accent shadow-accent/30 shadow-md" />
                        )}
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-accent" : "text-primary/30 group-hover:text-primary/50"}`}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 whitespace-nowrap">
                              {item.label}
                            </span>
                            {item.badge && item.badge > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-semibold text-[11px] text-white">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-accent font-bold text-[9px] text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-black/5 border-t p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-primary/40 text-sm transition-all hover:bg-accent-secondary-light hover:text-primary/60"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="flex-1 whitespace-nowrap text-left">
                {t("collapse")}
              </span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-primary/40 text-sm transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap">{t("signOut")}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
