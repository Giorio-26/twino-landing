"use client";

import { AlertTriangle, Bell, Building2, Globe, Key, Mail, Save, Shield, Trash2, User, Users } from "lucide-react";
import { useState } from "react";

const inputCls = "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

export default function SettingsPage() {
	const [agency, setAgency] = useState({ name: "", email: "", phone: "", website: "" });
	const [notifications, setNotifications] = useState({ email: true, telegram: true, takeover: true });

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div className="dash-animate-in">
				<h2 className="font-Helvetica-Neue text-2xl font-bold text-dash-text">Settings</h2>
				<p className="mt-1 text-sm text-dash-text-secondary">Manage your account and preferences.</p>
			</div>

			{/* Agency Profile */}
			<div className="dash-card overflow-hidden dash-animate-in" style={{ animationDelay: "0.05s" }}>
				<div className="flex items-center gap-4 border-b border-dash-border p-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted"><Building2 className="h-5 w-5 text-dash-accent" /></div>
					<div><h3 className="font-Helvetica-Neue text-sm font-semibold text-dash-text">Agency Profile</h3><p className="text-xs text-dash-text-muted">Your agency&apos;s basic information</p></div>
				</div>
				<div className="grid gap-5 p-6 sm:grid-cols-2">
					<div className="space-y-2"><label className="block text-sm font-medium text-dash-text-secondary">Agency Name</label><input type="text" value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} placeholder="Sakura Properties" className={inputCls} /></div>
					<div className="space-y-2"><label className="block text-sm font-medium text-dash-text-secondary">Email</label><input type="email" value={agency.email} onChange={(e) => setAgency({ ...agency, email: e.target.value })} placeholder="info@sakura.ge" className={inputCls} /></div>
					<div className="space-y-2"><label className="block text-sm font-medium text-dash-text-secondary">Phone</label><input type="tel" value={agency.phone} onChange={(e) => setAgency({ ...agency, phone: e.target.value })} placeholder="+995 555 123 456" className={inputCls} /></div>
					<div className="space-y-2"><label className="block text-sm font-medium text-dash-text-secondary">Website</label><input type="url" value={agency.website} onChange={(e) => setAgency({ ...agency, website: e.target.value })} placeholder="https://sakura.ge" className={inputCls} /></div>
				</div>
				<div className="border-t border-dash-border px-6 py-4 flex justify-end">
					<button type="button" className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-dash-accent-hover"><Save className="h-4 w-4" />Save Changes</button>
				</div>
			</div>

			{/* Notifications */}
			<div className="dash-card overflow-hidden dash-animate-in" style={{ animationDelay: "0.1s" }}>
				<div className="flex items-center gap-4 border-b border-dash-border p-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-warning-muted"><Bell className="h-5 w-5 text-dash-warning" /></div>
					<div><h3 className="font-Helvetica-Neue text-sm font-semibold text-dash-text">Notifications</h3><p className="text-xs text-dash-text-muted">Choose what you want to be notified about</p></div>
				</div>
				<div className="p-6 space-y-4">
					{[
						{ key: "email", label: "Email notifications", desc: "Receive daily lead summaries via email" },
						{ key: "telegram", label: "Telegram alerts", desc: "Get instant alerts for urgent events" },
						{ key: "takeover", label: "Agent takeover alerts", desc: "Get notified when AI requests human intervention" },
					].map((n) => (
						<div key={n.key} className="flex items-center justify-between rounded-xl border border-dash-border p-4">
							<div><div className="text-sm font-medium text-dash-text">{n.label}</div><div className="text-xs text-dash-text-muted">{n.desc}</div></div>
							<button type="button" onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key as keyof typeof notifications] })} className={`relative h-6 w-11 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? "bg-dash-accent" : "bg-dash-surface-secondary"}`}>
								<span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Team Members (Placeholder) */}
			<div className="dash-card p-6 opacity-60 dash-animate-in" style={{ animationDelay: "0.15s" }}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted"><Users className="h-5 w-5 text-dash-purple" /></div>
						<div><h3 className="font-Helvetica-Neue text-sm font-semibold text-dash-text">Team Members</h3><p className="text-xs text-dash-text-muted">Invite agents to your TwinO workspace.</p></div>
					</div>
					<span className="rounded-full bg-dash-purple-muted px-3 py-1 text-xs font-semibold text-dash-purple">Coming Soon</span>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="rounded-2xl border border-dash-danger/20 overflow-hidden dash-animate-in" style={{ animationDelay: "0.2s" }}>
				<div className="flex items-center gap-4 border-b border-dash-danger/10 bg-dash-danger-muted/30 p-6">
					<AlertTriangle className="h-5 w-5 text-dash-danger" />
					<h3 className="font-Helvetica-Neue text-sm font-semibold text-dash-danger">Danger Zone</h3>
				</div>
				<div className="p-6 bg-dash-surface">
					<div className="flex items-center justify-between">
						<div><div className="text-sm font-medium text-dash-text">Delete Account</div><div className="text-xs text-dash-text-muted">Permanently delete your agency and all data.</div></div>
						<button type="button" className="flex items-center gap-2 rounded-xl border border-dash-danger/30 px-4 py-2 text-sm font-medium text-dash-danger transition-colors hover:bg-dash-danger-muted"><Trash2 className="h-4 w-4" />Delete</button>
					</div>
				</div>
			</div>
		</div>
	);
}
