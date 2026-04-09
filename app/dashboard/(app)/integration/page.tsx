"use client";

import { Bell, Check, CheckCircle2, Circle, Copy, ExternalLink, MessageSquare, Send, Shield, Webhook, Zap } from "lucide-react";
import { useState } from "react";

const webhookUrl = "https://twino.tchavtchanidze.com/api/webhook/YOUR_AGENCY_ID";

const steps = [
	{ num: 1, title: "Create Meta Business Account", desc: "Go to business.facebook.com and create a business account if you don't have one.", link: "https://business.facebook.com" },
	{ num: 2, title: "Set Up WhatsApp Business API", desc: "In Meta Business Suite, navigate to WhatsApp > Getting Started and follow the setup wizard.", link: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" },
	{ num: 3, title: "Configure Webhook URL", desc: "In your WhatsApp app settings, set the webhook URL to your unique TwinO endpoint (shown below)." },
	{ num: 4, title: "Verify & Test", desc: "Send a test message to your WhatsApp Business number. If everything is set up correctly, you'll see it appear in TwinO." },
];

export default function IntegrationPage() {
	const [copied, setCopied] = useState(false);
	const [telegramToken, setTelegramToken] = useState("");
	const [telegramChatId, setTelegramChatId] = useState("");

	const copyWebhook = () => {
		navigator.clipboard.writeText(webhookUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const inputCls = "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="dash-animate-in">
				<h2 className="text-2xl font-bold text-dash-text">Integration</h2>
				<p className="mt-1 text-sm text-dash-text-secondary">Connect your communication channels to TwinO.</p>
			</div>

			{/* Connection Status */}
			<div className="dash-card p-6 dash-animate-in" style={{ animationDelay: "0.05s" }}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
							<MessageSquare className="h-6 w-6 text-green-500" />
						</div>
						<div>
							<h3 className="text-base font-semibold text-dash-text">WhatsApp Business</h3>
							<div className="mt-0.5 flex items-center gap-2 text-xs">
								<Circle className="h-2.5 w-2.5 fill-dash-text-muted text-dash-text-muted" />
								<span className="text-dash-text-muted">Not Connected</span>
							</div>
						</div>
					</div>
					<span className="rounded-full bg-dash-surface-secondary px-3 py-1 text-xs font-medium text-dash-text-muted">Setup Required</span>
				</div>
			</div>

			{/* WhatsApp Setup Steps */}
			<div className="dash-card overflow-hidden dash-animate-in" style={{ animationDelay: "0.1s" }}>
				<div className="border-b border-dash-border p-6">
					<h3 className="text-base font-semibold text-dash-text">WhatsApp Setup Guide</h3>
					<p className="mt-1 text-xs text-dash-text-muted">Follow these steps to connect your WhatsApp Business number.</p>
				</div>
				<div className="p-6 space-y-6">
					{steps.map((step) => (
						<div key={step.num} className="flex gap-4">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dash-border bg-dash-surface-secondary text-sm font-bold text-dash-text-secondary">{step.num}</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-sm font-semibold text-dash-text">{step.title}</h4>
								<p className="mt-1 text-xs text-dash-text-muted leading-relaxed">{step.desc}</p>
								{step.link && (
									<a href={step.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dash-accent no-underline hover:text-dash-accent-hover">
										Open Guide <ExternalLink className="h-3 w-3" />
									</a>
								)}
							</div>
						</div>
					))}

					{/* Webhook URL */}
					<div className="rounded-xl border border-dash-accent/20 bg-dash-accent-muted/30 p-4">
						<div className="flex items-center gap-2 mb-3">
							<Webhook className="h-4 w-4 text-dash-accent" />
							<span className="text-xs font-semibold text-dash-accent">Your Webhook URL</span>
						</div>
						<div className="flex items-center gap-2">
							<code className="flex-1 rounded-lg bg-dash-bg px-3 py-2.5 text-xs text-dash-text font-mono truncate">{webhookUrl}</code>
							<button type="button" onClick={copyWebhook} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-white transition-colors hover:bg-dash-accent-hover">
								{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Telegram Notifications */}
			<div className="dash-card overflow-hidden dash-animate-in" style={{ animationDelay: "0.15s" }}>
				<div className="border-b border-dash-border p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted"><Bell className="h-5 w-5 text-dash-accent" /></div>
						<div>
							<h3 className="text-base font-semibold text-dash-text">Telegram Notifications</h3>
							<p className="text-xs text-dash-text-muted">Get notified when agent takeover is needed.</p>
						</div>
					</div>
				</div>
				<div className="p-6 space-y-4">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-dash-text-secondary">Bot Token</label>
						<input type="text" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" className={inputCls} />
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-dash-text-secondary">Chat ID</label>
						<input type="text" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="-1001234567890" className={inputCls} />
					</div>
					<div className="flex gap-3">
						<button type="button" className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-dash-accent-hover"><Shield className="h-4 w-4" />Save</button>
						<button type="button" className="flex items-center gap-2 rounded-xl border border-dash-border px-4 py-2.5 text-sm font-medium text-dash-text-secondary hover:bg-dash-surface-hover"><Send className="h-4 w-4" />Test Notification</button>
					</div>
				</div>
			</div>

			{/* Google Sheets / CRM Placeholder */}
			<div className="dash-card p-6 opacity-60 dash-animate-in" style={{ animationDelay: "0.2s" }}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-surface-secondary"><Zap className="h-6 w-6 text-dash-text-muted" /></div>
						<div>
							<h3 className="text-base font-semibold text-dash-text">Google Sheets / CRM</h3>
							<p className="text-xs text-dash-text-muted">Auto-export leads to your spreadsheet.</p>
						</div>
					</div>
					<span className="rounded-full bg-dash-purple-muted px-3 py-1 text-xs font-semibold text-dash-purple">Coming Soon</span>
				</div>
			</div>
		</div>
	);
}
