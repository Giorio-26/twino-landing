"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardShellProps {
	children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="dashboard-theme flex h-screen overflow-hidden bg-dash-bg">
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex">
				<Sidebar />
			</div>

			{/* Mobile Sidebar Overlay */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-50 flex lg:hidden">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
						onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
					/>
					{/* Sidebar */}
					<div className="relative z-10 dash-animate-slide">
						<Sidebar />
						<button
							type="button"
							onClick={() => setMobileMenuOpen(false)}
							className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-dash-surface text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<Topbar onMenuToggle={() => setMobileMenuOpen(true)} />
				<main className="flex-1 overflow-y-auto bg-dash-bg-subtle p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
