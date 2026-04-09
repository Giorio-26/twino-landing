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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
	label: string;
	href: string;
	icon: React.ElementType;
	badge?: number;
}

const navItems: NavItem[] = [
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

	const isActive = (href: string) => {
		if (href === "/dashboard") return pathname === "/dashboard";
		return pathname.startsWith(href);
	};

	return (
		<aside
			className={`group/sidebar relative flex h-screen flex-col border-r border-dash-border bg-dash-bg transition-all duration-300 ease-in-out ${
				collapsed ? "w-[72px]" : "w-[260px]"
			}`}
		>
			{/* Logo */}
			<div className="flex h-16 shrink-0 items-center gap-3 border-b border-dash-border px-5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-sm font-bold text-white shadow-md shadow-dash-accent/20">
					T
				</div>
				{!collapsed && (
					<span className="font-Helvetica-Neue text-lg font-bold text-dash-text whitespace-nowrap">
						Twin<span className="text-dash-accent">O</span>
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
								className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all duration-200 ${
									active
										? "bg-dash-accent-muted text-dash-accent"
										: "text-dash-text-secondary hover:bg-dash-surface-hover hover:text-dash-text"
								}`}
							>
								{/* Active indicator */}
								{active && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-dash-accent shadow-md shadow-dash-accent/30" />
								)}
								<Icon
									className={`h-[18px] w-[18px] shrink-0 transition-colors ${
										active ? "text-dash-accent" : "text-dash-text-muted group-hover:text-dash-text-secondary"
									}`}
								/>
								{!collapsed && (
									<>
										<span className="flex-1 whitespace-nowrap">{item.label}</span>
										{item.badge && (
											<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dash-accent px-1.5 text-[11px] font-semibold text-white">
												{item.badge}
											</span>
										)}
									</>
								)}
								{collapsed && item.badge && (
									<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dash-accent text-[9px] font-bold text-white">
										{item.badge}
									</span>
								)}
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Bottom Section */}
			<div className="border-t border-dash-border p-3">
				{/* Collapse Button */}
				<button
					type="button"
					onClick={() => setCollapsed(!collapsed)}
					className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-dash-text-muted transition-all duration-200 hover:bg-dash-surface-hover hover:text-dash-text-secondary"
				>
					{collapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<>
							<ChevronLeft className="h-4 w-4" />
							<span className="flex-1 text-left whitespace-nowrap">Collapse</span>
						</>
					)}
				</button>

				{/* Logout */}
				<button
					type="button"
					onClick={handleLogout}
					className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-dash-text-muted transition-all duration-200 hover:bg-dash-danger-muted hover:text-dash-danger"
				>
					<LogOut className="h-[18px] w-[18px] shrink-0" />
					{!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
				</button>
			</div>
		</aside>
	);
}
