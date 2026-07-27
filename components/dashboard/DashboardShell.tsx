"use client";

import { Bell, Search, X, AlertTriangle, CheckCircle2, MessageSquare, Users, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import TwinStatusBadge from "./TwinStatusBadge";

const routeTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/configure": "Twin Setup",
  "/dashboard/conversations": "Conversations",
  "/dashboard/leads": "Pipeline",
  "/dashboard/integration": "Integrations",
  "/dashboard/settings": "Settings",
};

type NotificationPriority = "critical" | "high" | "low";

interface Notification {
  id: string;
  type: "lead" | "conversation" | "takeover" | "booking" | "sync" | "system";
  priority: NotificationPriority;
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "takeover",
    priority: "critical",
    title: "AI needs human attention",
    description: "Complex legal question from Giorgi M. — agent takeover requested",
    time: "2 min ago",
    read: false,
    actionUrl: "/dashboard/conversations",
  },
  {
    id: "2",
    type: "lead",
    priority: "high",
    title: "New qualified lead",
    description: "Nino T. — Budget $120K, Tbilisi, Living",
    time: "8 min ago",
    read: false,
    actionUrl: "/dashboard/leads",
  },
  {
    id: "3",
    type: "booking",
    priority: "high",
    title: "Meeting booked",
    description: "Ana K. — Saturday 14:00",
    time: "25 min ago",
    read: false,
    actionUrl: "/dashboard/conversations",
  },
  {
    id: "4",
    type: "conversation",
    priority: "low",
    title: "Twin responded to 3 new messages",
    description: "All conversations resolved automatically",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "5",
    type: "system",
    priority: "low",
    title: "Daily summary ready",
    description: "24 leads processed, 6 qualified, 1 meeting booked",
    time: "Yesterday",
    read: true,
  },
];

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

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
  const criticalCount = NOTIFICATIONS.filter((n) => !n.read && n.priority === "critical").length;

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

  const priorityStyles: Record<NotificationPriority, { bg: string; icon: string; badge: string }> = {
    critical: { bg: "bg-dash-danger-muted/50", icon: "text-dash-danger", badge: "bg-dash-danger" },
    high: { bg: "bg-dash-warning-muted/30", icon: "text-dash-warning", badge: "bg-dash-warning" },
    low: { bg: "bg-dash-surface-hover", icon: "text-dash-text-muted", badge: "bg-dash-text-muted" },
  };

  const notificationIcons = {
    lead: Users,
    conversation: MessageSquare,
    takeover: AlertTriangle,
    booking: Calendar,
    sync: CheckCircle2,
    system: Bell,
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
                {unreadCount > 0 && (
                  <span className={`-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full font-bold text-[9px] text-white ${criticalCount > 0 ? "bg-dash-danger" : "bg-dash-accent"}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="dash-animate-scale absolute top-full right-0 z-40 mt-2 w-96 rounded-2xl border border-dash-border bg-dash-surface shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-dash-border border-b">
                    <h4 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Notifications</h4>
                    <button type="button" className="text-dash-accent text-xs font-medium hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {NOTIFICATIONS.map((notif) => {
                      const Icon = notificationIcons[notif.type];
                      const style = priorityStyles[notif.priority];
                      return (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => {
                            if (notif.actionUrl) {
                              window.location.href = notif.actionUrl;
                            }
                            setNotifOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-dash-surface-hover ${notif.read ? "opacity-60" : ""}`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                            <Icon className={`h-4 w-4 ${style.icon}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-dash-text text-sm font-medium leading-tight">
                              {notif.title}
                            </p>
                            <p className="mt-0.5 text-dash-text-muted text-xs leading-relaxed">
                              {notif.description}
                            </p>
                            <p className="mt-1 text-dash-text-muted text-[11px]">{notif.time}</p>
                          </div>
                          {!notif.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-dash-accent" />
                          )}
                        </button>
                      );
                    })}
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
                    Settings
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-dash-text-secondary text-sm hover:bg-dash-surface-hover">
                    Help & Support
                  </button>
                  <div className="border-dash-border border-t" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-dash-danger text-sm hover:bg-dash-danger-muted"
                  >
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
