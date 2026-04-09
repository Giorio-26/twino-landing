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
		<header className="flex h-16 shrink-0 items-center justify-between border-b border-dash-border bg-dash-bg/80 px-6 backdrop-blur-xl">
			{/* Left: Mobile menu + Title */}
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={onMenuToggle}
					className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text lg:hidden"
				>
					<Menu className="h-5 w-5" />
				</button>

				<div>
					<h1 className="text-lg font-semibold text-dash-text">{title}</h1>
				</div>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2">
				{/* Search */}
				<div className={`relative transition-all duration-300 ${searchOpen ? "w-64" : "w-9"}`}>
					{searchOpen ? (
						<div className="flex items-center rounded-xl border border-dash-border bg-dash-surface">
							<Search className="ml-3 h-4 w-4 shrink-0 text-dash-text-muted" />
							<input
								type="text"
								placeholder="Search..."
								autoFocus
								className="w-full bg-transparent py-2 pl-2 pr-3 text-sm text-dash-text placeholder-dash-text-muted focus:outline-none"
							/>
							<button
								type="button"
								onClick={() => setSearchOpen(false)}
								className="mr-2 shrink-0 text-dash-text-muted hover:text-dash-text"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setSearchOpen(true)}
							className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text-secondary"
						>
							<Search className="h-[18px] w-[18px]" />
						</button>
					)}
				</div>

				{/* Notifications */}
				<button
					type="button"
					className="relative flex h-9 w-9 items-center justify-center rounded-lg text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text-secondary"
				>
					<Bell className="h-[18px] w-[18px]" />
					<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dash-accent text-[9px] font-bold text-white">
						2
					</span>
				</button>

				{/* User Avatar */}
				<button
					type="button"
					className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-dash-accent to-dash-purple text-xs font-bold text-white ring-2 ring-dash-border transition-all hover:ring-dash-accent/30"
				>
					A
				</button>
			</div>
		</header>
	);
}
