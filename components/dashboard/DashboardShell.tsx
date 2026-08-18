"use client";

import { Bell, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import TwinStatusBadge from "./TwinStatusBadge";

const routeTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/configure": "Configure Twin",
  "/dashboard/conversations": "Conversations",
  "/dashboard/leads": "Pipeline",
  "/dashboard/properties": "Properties",
  "/dashboard/integration": "Integrations",
  "/dashboard/settings": "Settings",
};

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Dashboard";

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notif]") && !target.closest("[data-profile]")) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/dashboard/sign-out", { method: "POST" });
    window.location.href = "/en/dashboard/access";
  };

  return (
    <div className="dashboard-theme flex h-screen overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
          />
          <div className="dash-animate-slide relative z-10">
            <Sidebar />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-secondary-light text-primary/50 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-black/5 border-b bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/40 hover:bg-accent-secondary-light hover:text-primary lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-Helvetica-Neue font-semibold text-lg text-primary">
              {title}
            </h1>
            <TwinStatusBadge />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div
              className={`relative transition-all duration-300 ${searchOpen ? "w-48 sm:w-64" : "w-9"}`}
            >
              {searchOpen ? (
                <div className="flex items-center rounded-xl border border-black/10 bg-accent-secondary-light">
                  <Search className="ml-3 h-4 w-4 shrink-0 text-primary/30" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search leads, conversations..."
                    className="w-full bg-transparent py-2 pr-3 pl-2 text-primary text-sm placeholder-primary/30 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="mr-2 shrink-0 text-primary/30 hover:text-primary/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/40 hover:bg-accent-secondary-light hover:text-primary/60"
                  aria-label="Search"
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" data-notif>
              <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-primary/40 hover:bg-accent-secondary-light hover:text-primary/60"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-accent font-bold text-[9px] text-white">
                  2
                </span>
              </button>
              {notifOpen && (
                <div className="dash-animate-scale absolute top-full right-0 z-40 mt-2 w-80 rounded-2xl border border-dash-border bg-dash-surface p-1 shadow-xl">
                  <div className="px-4 py-3">
                    <h4 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Notifications</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="rounded-xl bg-dash-accent-muted/50 p-3">
                      <p className="text-dash-text text-sm">AI requested takeover — complex legal question from Giorgi M.</p>
                      <p className="mt-1 text-dash-text-muted text-xs">2 min ago</p>
                    </div>
                    <div className="rounded-xl bg-dash-surface-hover p-3">
                      <p className="text-dash-text text-sm">3 new leads qualified from WhatsApp</p>
                      <p className="mt-1 text-dash-text-muted text-xs">15 min ago</p>
                    </div>
                  </div>
                  <div className="border-dash-border border-t px-4 py-2">
                    <button type="button" className="text-dash-accent text-xs font-medium hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative ml-1" data-profile>
              <button
                type="button"
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-500 font-bold text-white text-xs ring-2 ring-black/5 transition-all hover:ring-accent/20"
                aria-label="Profile menu"
              >
                A
              </button>
              {profileOpen && (
                <div className="dash-animate-scale absolute top-full right-0 z-40 mt-2 w-56 rounded-2xl border border-dash-border bg-dash-surface p-1 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Admin</p>
                    <p className="text-dash-text-muted text-xs">Sales Director</p>
                  </div>
                  <div className="border-dash-border border-t" />
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-dash-text-secondary text-sm hover:bg-dash-surface-hover">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-dash-text-secondary text-sm hover:bg-dash-surface-hover">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Help & Support
                  </button>
                  <div className="border-dash-border border-t" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-dash-danger text-sm hover:bg-dash-danger-muted"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-accent-secondary-light/50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
