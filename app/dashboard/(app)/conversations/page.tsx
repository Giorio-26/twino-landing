"use client";

import { Check, CheckCheck, Circle, Filter, MessageSquare, Phone, Search, Send, User, Zap } from "lucide-react";
import { useState } from "react";

interface Message { role: "user" | "ai" | "agent"; text: string; time: string; }
interface Conversation { id: string; name: string; phone: string; channel: "whatsapp" | "instagram" | "facebook"; lastMessage: string; time: string; unread: number; budget: string | null; location: string | null; intent: string | null; messages: Message[]; }

const mockConversations: Conversation[] = [
	{ id: "1", name: "Giorgi M.", phone: "+995 555 123 456", channel: "whatsapp", lastMessage: "I'm looking for investment property in Batumi", time: "2m ago", unread: 2, budget: "$80,000", location: "Batumi", intent: "Investment", messages: [
		{ role: "user", text: "Hi, I saw your ad about apartments in Batumi. Is it still available?", time: "10:31 AM" },
		{ role: "ai", text: "Hello! Yes, we have several apartments available in Batumi! 🏠 Are you looking for an investment property or for living? And what's your target budget?", time: "10:31 AM" },
		{ role: "user", text: "Investment. Around $80k.", time: "10:32 AM" },
		{ role: "ai", text: "Perfect! We have 2 units in Orbi yielding 11% ROI in that range. Shall I send the PDF breakdown or book a call with our senior agent?", time: "10:32 AM" },
		{ role: "user", text: "Send me the PDF please", time: "10:33 AM" },
	]},
	{ id: "2", name: "Ana K.", phone: "+995 598 765 432", channel: "instagram", lastMessage: "What about Tbilisi options?", time: "15m ago", unread: 0, budget: "$120,000", location: "Tbilisi", intent: "Living", messages: [
		{ role: "user", text: "Hello, I need a 3-bedroom apartment in Tbilisi for my family", time: "9:15 AM" },
		{ role: "ai", text: "Hi! Welcome! I'd love to help you find the perfect home for your family. What area of Tbilisi do you prefer, and what's your budget range?", time: "9:15 AM" },
		{ role: "user", text: "Vake or Saburtalo. Budget around $120k", time: "9:17 AM" },
		{ role: "ai", text: "Great choices! We have 3 beautiful apartments in Vake starting at $110K. Would you like to schedule a viewing this week?", time: "9:17 AM" },
	]},
	{ id: "3", name: "Unknown", phone: "+995 577 000 111", channel: "whatsapp", lastMessage: "რა ღირს?", time: "34m ago", unread: 1, budget: null, location: null, intent: null, messages: [
		{ role: "user", text: "რა ღირს?", time: "9:50 AM" },
		{ role: "ai", text: "გამარჯობა! რომელი ქალაქი გაინტერესებთ — ბათუმი, თბილისი თუ სხვა? და რა ბიუჯეტს განიხილავთ?", time: "9:50 AM" },
	]},
	{ id: "4", name: "David R.", phone: "+44 7700 900000", channel: "facebook", lastMessage: "Can you send the floor plan?", time: "1h ago", unread: 0, budget: "$60,000", location: "Batumi", intent: "Investment", messages: [
		{ role: "user", text: "Hi there, interested in Batumi property for Airbnb investment", time: "8:30 AM" },
		{ role: "ai", text: "Hello David! Batumi is excellent for Airbnb. What budget range are you considering?", time: "8:30 AM" },
		{ role: "user", text: "Around 60k USD", time: "8:32 AM" },
		{ role: "ai", text: "We have a perfect studio in Orbi City at $58K with projected 12% yield. Can you send the floor plan?", time: "8:32 AM" },
	]},
];

const channelColors: Record<string, string> = { whatsapp: "bg-green-500", instagram: "bg-pink-500", facebook: "bg-blue-500" };

export default function ConversationsPage() {
	const [selected, setSelected] = useState(mockConversations[0]);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	const filtered = mockConversations.filter((c) => {
		if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
		if (filter === "active") return c.unread > 0;
		if (filter === "qualified") return c.budget && c.location && c.intent;
		if (filter === "attention") return !c.budget || !c.location || !c.intent;
		return true;
	});

	const QualBadge = ({ label, value }: { label: string; value: string | null }) => (
		<div className={`flex items-center gap-2 rounded-lg p-2.5 ${value ? "bg-dash-success-muted" : "bg-dash-surface-secondary"}`}>
			{value ? <Check className="h-3.5 w-3.5 text-dash-success" /> : <Circle className="h-3.5 w-3.5 text-dash-text-muted" />}
			<div><div className="text-[10px] font-medium text-dash-text-muted uppercase">{label}</div><div className={`text-xs font-semibold ${value ? "text-dash-success" : "text-dash-text-muted"}`}>{value || "Pending"}</div></div>
		</div>
	);

	return (
		<div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-2xl border border-dash-border bg-dash-surface dash-animate-in">
			{/* Left: Conversation List */}
			<div className="flex w-80 shrink-0 flex-col border-r border-dash-border">
				<div className="border-b border-dash-border p-4">
					<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full rounded-lg border border-dash-border bg-dash-bg py-2 pl-9 pr-3 text-sm text-dash-text placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none" /></div>
					<div className="mt-3 flex gap-1">
						{["all", "active", "qualified", "attention"].map((f) => (
							<button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-dash-accent-muted text-dash-accent" : "text-dash-text-muted hover:text-dash-text-secondary"}`}>{f === "attention" ? "⚠️ Needs" : f}</button>
						))}
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					{filtered.map((c) => (
						<button key={c.id} type="button" onClick={() => setSelected(c)} className={`flex w-full items-start gap-3 border-b border-dash-border p-4 text-left transition-colors ${selected.id === c.id ? "bg-dash-accent-muted/30" : "hover:bg-dash-surface-hover"}`}>
							<div className="relative">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-dash-surface-secondary text-sm font-semibold text-dash-text">{c.name[0]}</div>
								<span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-dash-surface ${channelColors[c.channel]}`} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between"><span className="text-sm font-semibold text-dash-text">{c.name}</span><span className="text-[11px] text-dash-text-muted">{c.time}</span></div>
								<p className="mt-0.5 truncate text-xs text-dash-text-muted">{c.lastMessage}</p>
								<div className="mt-1.5 flex items-center gap-1">
									{c.budget && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />}
									{c.location && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />}
									{c.intent && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />}
									{(!c.budget || !c.location || !c.intent) && <span className="h-1.5 w-1.5 rounded-full bg-dash-text-muted animate-pulse" />}
								</div>
							</div>
							{c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dash-accent px-1 text-[10px] font-bold text-white">{c.unread}</span>}
						</button>
					))}
				</div>
			</div>

			{/* Center: Chat */}
			<div className="flex flex-1 flex-col">
				<div className="flex items-center justify-between border-b border-dash-border px-6 py-3">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-surface-secondary text-sm font-semibold text-dash-text">{selected.name[0]}</div>
						<div><div className="text-sm font-semibold text-dash-text">{selected.name}</div><div className="text-xs text-dash-text-muted">{selected.phone}</div></div>
					</div>
					<div className="flex items-center gap-2">
						<button type="button" className="flex items-center gap-1.5 rounded-lg border border-dash-warning/30 bg-dash-warning-muted px-3 py-1.5 text-xs font-semibold text-dash-warning transition-colors hover:bg-dash-warning/20">
							<User className="h-3.5 w-3.5" />Take Over
						</button>
					</div>
				</div>

				<div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ background: "var(--dash-bg)" }}>
					{selected.messages.map((msg, i) => (
						<div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							<div className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm bg-dash-accent text-white" : "rounded-tl-sm bg-dash-surface text-dash-text border border-dash-border"}`}>
								{msg.role === "ai" && <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-dash-accent"><Zap className="h-3 w-3" />Sales Twin</div>}
								<span>{msg.text}</span>
								<div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${msg.role === "user" ? "text-white/60" : "text-dash-text-muted"}`}>{msg.time}{msg.role === "user" && <CheckCheck className="h-3 w-3" />}</div>
							</div>
						</div>
					))}
				</div>

				<div className="border-t border-dash-border p-4">
					<div className="flex items-center gap-2">
						<input type="text" placeholder="Type a message..." className="flex-1 rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none" />
						<button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl bg-dash-accent text-white transition-colors hover:bg-dash-accent-hover"><Send className="h-4 w-4" /></button>
					</div>
				</div>
			</div>

			{/* Right: Lead Sidebar */}
			<div className="hidden w-64 shrink-0 flex-col border-l border-dash-border xl:flex">
				<div className="border-b border-dash-border p-4">
					<h4 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">Lead Qualification</h4>
				</div>
				<div className="flex-1 space-y-3 p-4">
					<QualBadge label="Budget" value={selected.budget} />
					<QualBadge label="Location" value={selected.location} />
					<QualBadge label="Intent" value={selected.intent} />

					{selected.budget && selected.location && selected.intent && (
						<div className="mt-4 rounded-xl border border-dash-success/20 bg-dash-success-muted p-4 text-center">
							<Check className="mx-auto h-6 w-6 text-dash-success" />
							<p className="mt-2 text-sm font-semibold text-dash-success">Fully Qualified</p>
							<p className="mt-1 text-xs text-dash-text-muted">Ready for agent handoff</p>
						</div>
					)}

					<div className="mt-6 space-y-2">
						<button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 text-xs font-semibold text-white hover:bg-dash-accent-hover">Send to CRM</button>
						<button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 text-xs font-semibold text-dash-text-secondary hover:bg-dash-surface-hover">Schedule Meeting</button>
					</div>
				</div>
			</div>
		</div>
	);
}
