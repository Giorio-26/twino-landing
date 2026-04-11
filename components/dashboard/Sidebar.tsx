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
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Configure Twin", href: "/dashboard/configure", icon: Cog },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
    badge: 3,
  },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Integration", href: "/dashboard/integration", icon: Plug },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dashboard/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside
      className={`group/sidebar relative flex h-screen flex-col border-black/5 border-r bg-white transition-all duration-300 ease-in-out ${collapsed ? "w-18" : "w-65"}`}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-black/5 border-b px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-sm text-white shadow-accent/20 shadow-md">
          T
        </div>
        {!collapsed && (
          <span className="whitespace-nowrap font-Helvetica-Neue font-bold text-lg text-primary">
            Twin<span className="text-accent">O</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
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
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${active ? "text-accent" : "text-primary/30 group-hover:text-primary/50"}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 whitespace-nowrap">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-semibold text-[11px] text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-accent font-bold text-[9px] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
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
                Collapse
              </span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-primary/40 text-sm transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
