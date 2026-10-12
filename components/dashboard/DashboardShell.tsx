"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Sidebar from "./Sidebar";

const routeTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/leads": "Leads",
  "/dashboard/presentations": "Presentations",
  "/dashboard/reservations": "Reservations",
  "/dashboard/properties": "Properties",
  "/dashboard/settings": "Settings",
  "/dashboard/configure": "Configure Twin",
  "/dashboard/conversations": "Conversations",
  "/dashboard/integration": "Integrations",
};

function titleFor(pathname: string) {
  const normalized = pathname.replace(/^\/(en|ka)/, "");
  if (/\/dashboard\/leads\/[^/]+\/matches/.test(normalized)) return "Property matching";
  if (/\/dashboard\/leads\/[^/]+/.test(normalized)) return "Buyer profile";
  if (/\/dashboard\/reservations\/[^/]+\/payment/.test(normalized)) return "Payment status";
  return routeTitles[normalized] ?? "TwinO";
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <div className="dashboard-theme flex h-screen overflow-hidden bg-dash-bg">
      <div className="hidden lg:flex"><Sidebar /></div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10">
            <Sidebar />
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute top-5 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-dash-surface-secondary text-dash-text-muted" aria-label="Close menu"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-18 shrink-0 items-center justify-between border-dash-border border-b bg-white px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-text-muted hover:bg-dash-surface-secondary lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-text-muted">Sales workspace</p>
              <h1 className="font-Helvetica-Neue font-semibold text-base text-dash-text sm:text-lg">{title}</h1>
            </div>
          </div>
          <Link href="/dashboard/settings" className="hidden items-center gap-2 rounded-full border border-dash-border bg-white px-3 py-1.5 text-dash-text-secondary text-xs no-underline hover:bg-dash-surface-secondary sm:flex">
            <span className="h-2 w-2 rounded-full bg-dash-text-muted" />
            Workspace
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto bg-dash-bg-subtle p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
