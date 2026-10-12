"use client";

import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  MessagesSquare,
  Settings,
  TicketCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: typeof BarChart3;
  section: "overview" | "sales" | "inventory" | "system";
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("dashboard.sidebar");
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: t("nav.overview"), href: "/dashboard", icon: BarChart3, section: "overview" },
    { label: t("nav.inbox"), href: "/dashboard/conversations", icon: MessagesSquare, section: "sales" },
    { label: t("nav.leads"), href: "/dashboard/leads", icon: Users, section: "sales" },
    { label: t("nav.presentations"), href: "/dashboard/presentations", icon: FileText, section: "sales" },
    { label: t("nav.reservations"), href: "/dashboard/reservations", icon: TicketCheck, section: "sales" },
    { label: t("nav.properties"), href: "/dashboard/properties", icon: Building2, section: "inventory" },
    { label: t("nav.settings"), href: "/dashboard/settings", icon: Settings, section: "system" },
  ];

  const sections = [
    { key: "overview", label: "", items: navItems.filter((item) => item.section === "overview") },
    { key: "sales", label: t("sections.sales"), items: navItems.filter((item) => item.section === "sales") },
    { key: "inventory", label: t("sections.inventory"), items: navItems.filter((item) => item.section === "inventory") },
    { key: "system", label: t("sections.system"), items: navItems.filter((item) => item.section === "system") },
  ];

  const handleLogout = async () => {
    await fetch("/api/dashboard/sign-out", { method: "POST" });
    router.push("/dashboard/access");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className={`relative flex h-screen flex-col border-dash-border border-r bg-white transition-[width] duration-300 ${collapsed ? "w-[72px]" : "w-[248px]"}`}>
      <div className="flex h-18 shrink-0 items-center border-dash-border border-b px-5">
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent font-bold text-sm text-white">T</div>
        ) : (
          <Image src="/images/twino.svg" alt={t("name")} width={112} height={30} priority />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.key}>
              {!collapsed && section.label && (
                <p className="mb-2 px-3 font-semibold text-[10px] uppercase tracking-[0.16em] text-dash-text-muted">{section.label}</p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm no-underline transition-colors ${active ? "bg-dash-accent-muted text-dash-accent" : "text-dash-text-secondary hover:bg-dash-surface-secondary hover:text-dash-text"}`}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-dash-accent" : "text-dash-text-muted"}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-dash-border border-t p-3">
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-dash-text-muted text-sm hover:bg-dash-surface-secondary hover:text-dash-text">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span className="flex-1 text-left">{t("collapse")}</span></>}
        </button>
        <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-dash-text-muted text-sm hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{t("signOut")}</span>}
        </button>
      </div>
    </aside>
  );
}
