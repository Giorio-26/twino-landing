"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="dashboard-theme flex h-screen overflow-hidden bg-white">
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex"><Sidebar /></div>

			{/* Mobile Sidebar Overlay */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-50 flex lg:hidden">
					<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)} />
					<div className="relative z-10 dash-animate-slide">
						<Sidebar />
						<button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-secondary-light text-primary/50 hover:text-primary"><X className="h-4 w-4" /></button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<Topbar onMenuToggle={() => setMobileMenuOpen(true)} />
				<main className="flex-1 overflow-y-auto bg-accent-secondary-light/50 p-6">{children}</main>
			</div>
		</div>
	);
}
