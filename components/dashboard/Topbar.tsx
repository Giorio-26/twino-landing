"use client";

import { Bell, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/configure": "Configure Twin",
  "/dashboard/conversations": "Conversations",
  "/dashboard/leads": "Leads",
  "/dashboard/integration": "Integration",
  "/dashboard/settings": "Settings",
};

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const title = routeTitles[pathname] || "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-black/5 border-b bg-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/40 hover:bg-accent-secondary-light hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-Helvetica-Neue font-semibold text-lg text-primary">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`relative transition-all duration-300 ${searchOpen ? "w-64" : "w-9"}`}
        >
          {searchOpen ? (
            <div className="flex items-center rounded-xl border border-black/10 bg-accent-secondary-light">
              <Search className="ml-3 h-4 w-4 shrink-0 text-primary/30" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent py-2 pr-3 pl-2 text-primary text-sm placeholder-primary/30 focus:outline-none"
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
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-primary/40 hover:bg-accent-secondary-light hover:text-primary/60"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-accent font-bold text-[9px] text-white">
            2
          </span>
        </button>

        <button
          type="button"
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-500 font-bold text-white text-xs ring-2 ring-black/5 transition-all hover:ring-accent/20"
        >
          A
        </button>
      </div>
    </header>
  );
}
