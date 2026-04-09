"use client";

import {
	ArrowUpRight,
	BarChart3,
	Cog,
	MessageSquare,
	Plug,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";

const stats = [
	{
		label: "Active Conversations",
		value: "12",
		change: "+3 today",
		trend: "up",
		icon: MessageSquare,
		color: "text-dash-accent",
		bg: "bg-dash-accent-muted",
	},
	{
		label: "Qualified Leads",
		value: "47",
		change: "+8 this week",
		trend: "up",
		icon: Users,
		color: "text-dash-success",
		bg: "bg-dash-success-muted",
	},
	{
		label: "Avg Response Time",
		value: "8s",
		change: "-2s vs last week",
		trend: "up",
		icon: Zap,
		color: "text-dash-warning",
		bg: "bg-dash-warning-muted",
	},
	{
		label: "Conversion Rate",
		value: "34%",
		change: "+5% this month",
		trend: "up",
		icon: TrendingUp,
		color: "text-dash-purple",
		bg: "bg-dash-purple-muted",
	},
];

const recentActivity = [
	{
		type: "lead",
		text: "New qualified lead: Giorgi M. — Budget $80K, Batumi",
		time: "2 min ago",
		icon: Users,
		color: "text-dash-success",
	},
	{
		type: "conversation",
		text: 'Sales Twin responded to +995 555 *** — "Investment inquiry"',
		time: "5 min ago",
		icon: MessageSquare,
		color: "text-dash-accent",
	},
	{
		type: "alert",
		text: "Agent takeover requested — complex legal question detected",
		time: "12 min ago",
		icon: Zap,
		color: "text-dash-warning",
	},
	{
		type: "lead",
		text: "Lead qualified: Ana K. — Budget $120K, Tbilisi, Living",
		time: "25 min ago",
		icon: Users,
		color: "text-dash-success",
	},
	{
		type: "conversation",
		text: "New conversation started from WhatsApp",
		time: "34 min ago",
		icon: MessageSquare,
		color: "text-dash-accent",
	},
];

const quickActions = [
	{
		label: "Configure Twin",
		description: "Set up your AI assistant's personality",
		href: "/dashboard/configure",
		icon: Cog,
		gradient: "from-dash-accent/20 to-dash-accent/5",
	},
	{
		label: "View Leads",
		description: "See all qualified prospects",
		href: "/dashboard/leads",
		icon: Users,
		gradient: "from-dash-success/20 to-dash-success/5",
	},
	{
		label: "Setup WhatsApp",
		description: "Connect your business number",
		href: "/dashboard/integration",
		icon: Plug,
		gradient: "from-dash-purple/20 to-dash-purple/5",
	},
];

export default function DashboardOverview() {
	return (
		<div className="mx-auto max-w-7xl space-y-8">
			{/* Header */}
			<div className="dash-animate-in">
				<h2 className="font-Helvetica-Neue text-2xl font-bold text-dash-text">
					Good morning! 👋
				</h2>
				<p className="mt-1 text-sm text-dash-text-secondary">
					Here&apos;s what&apos;s happening with your Sales Twin today.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="dash-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className="dash-card dash-card-hover group p-5"
						>
							<div className="flex items-start justify-between">
								<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
									<Icon className={`h-5 w-5 ${stat.color}`} />
								</div>
								<span className="flex items-center gap-1 rounded-full bg-dash-success-muted px-2 py-0.5 text-[11px] font-medium text-dash-success">
									<TrendingUp className="h-3 w-3" />
									{stat.change}
								</span>
							</div>
							<div className="mt-4">
								<div className="text-3xl font-bold text-dash-text">
									{stat.value}
								</div>
								<div className="mt-1 text-sm text-dash-text-muted">
									{stat.label}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Recent Activity */}
				<div className="dash-card p-6 lg:col-span-3 dash-animate-in" style={{ animationDelay: "0.2s" }}>
					<div className="mb-5 flex items-center justify-between">
						<h3 className="font-Helvetica-Neue text-base font-semibold text-dash-text">
							Recent Activity
						</h3>
						<Link
							href="/dashboard/conversations"
							className="flex items-center gap-1 text-xs font-medium text-dash-accent no-underline transition-colors hover:text-dash-accent-hover"
						>
							View all
							<ArrowUpRight className="h-3 w-3" />
						</Link>
					</div>
					<div className="space-y-1">
						{recentActivity.map((item, i) => {
							const Icon = item.icon;
							return (
								<div
									key={i}
									className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-dash-surface-hover"
								>
									<div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-surface-secondary ${item.color}`}>
										<Icon className="h-4 w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm text-dash-text leading-relaxed">
											{item.text}
										</p>
										<p className="mt-0.5 text-xs text-dash-text-muted">
											{item.time}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="space-y-4 lg:col-span-2 dash-animate-in" style={{ animationDelay: "0.3s" }}>
					<h3 className="font-Helvetica-Neue text-base font-semibold text-dash-text">
						Quick Actions
					</h3>
					<div className="space-y-3">
						{quickActions.map((action) => {
							const Icon = action.icon;
							return (
								<Link
									key={action.href}
									href={action.href}
									className="group flex items-center gap-4 dash-card dash-card-hover p-5 no-underline"
								>
									<div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}>
										<Icon className="h-5 w-5 text-dash-text-secondary group-hover:text-dash-text transition-colors" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-sm font-semibold text-dash-text">
											{action.label}
										</div>
										<div className="text-xs text-dash-text-muted">
											{action.description}
										</div>
									</div>
									<ArrowUpRight className="h-4 w-4 shrink-0 text-dash-text-muted transition-all group-hover:text-dash-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								</Link>
							);
						})}
					</div>

					{/* Twin Status Card */}
					<div className="dash-card overflow-hidden p-5">
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-dash-accent to-dash-purple text-sm font-bold text-white">
									T
								</div>
								<span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-dash-surface bg-dash-success" />
							</div>
							<div>
								<div className="text-sm font-semibold text-dash-text">
									Sales Twin
								</div>
								<div className="flex items-center gap-1.5 text-xs text-dash-success">
									<span className="h-1.5 w-1.5 rounded-full bg-dash-success animate-pulse" />
									Active & Responding
								</div>
							</div>
						</div>
						<div className="mt-4 grid grid-cols-2 gap-3">
							<div className="rounded-lg bg-dash-bg p-3 text-center">
								<div className="text-lg font-bold text-dash-text">156</div>
								<div className="text-[11px] text-dash-text-muted">Messages today</div>
							</div>
							<div className="rounded-lg bg-dash-bg p-3 text-center">
								<div className="text-lg font-bold text-dash-text">92%</div>
								<div className="text-[11px] text-dash-text-muted">Auto-resolved</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
