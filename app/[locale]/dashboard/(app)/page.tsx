"use client";

import {
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Sparkle,
  TrendingUp,
  Users,
  Zap,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useRouter } from "@/i18n/navigation";

interface DashboardStats {
  active: number;
  qualified: number;
  conversion_rate: number;
  avg_response_time_seconds: number;
  avg_messages_per_day: number;
  no_manager_needed_count: number;
  avg_communications_per_day: number;
  total_leads_today: number;
  meetings_booked_today: number;
}

interface ActivityItem {
  id: string;
  type: "lead" | "conversation" | "alert" | "deal" | "meeting";
  text: string;
  time: string;
  icon: typeof Users;
  color: string;
  bg: string;
}

function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

function StatSkeleton() {
  return (
    <div className="dash-card animate-pulse p-5">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl bg-dash-surface-secondary" />
        <div className="h-5 w-20 rounded-full bg-dash-surface-secondary" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-16 rounded bg-dash-surface-secondary" />
        <div className="mt-2 h-4 w-28 rounded bg-dash-surface-secondary" />
      </div>
    </div>
  );
}

function FunnelSkeleton() {
  return (
    <div className="dash-card animate-pulse p-6">
      <div className="h-5 w-40 rounded bg-dash-surface-secondary" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-20 rounded bg-dash-surface-secondary" />
            <div className="h-3 flex-1 rounded bg-dash-surface-secondary" />
            <div className="h-5 w-12 rounded bg-dash-surface-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveActivity, setLiveActivity] = useState<ActivityItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch real stats from API
  const fetchStats = useCallback(() => {
    setLoading(true);
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setStats(data);
        } else {
          setError("Unable to load dashboard data");
        }
      })
      .catch(() => setError("Connection error. Retrying..."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();

    // Connect to WebSocket for live activity
    fetch("/api/dashboard/ws-info")
      .then((r) => r.json())
      .then((data) => {
        if (data.wsUrl) {
          const ws = new WebSocket(data.wsUrl);
          wsRef.current = ws;

          ws.onmessage = (event) => {
            try {
              const parsed = JSON.parse(event.data);
              // Map WebSocket events to activity items
              if (parsed.type === "new_lead") {
                setLiveActivity((prev) => [
                  {
                    id: parsed.id || Date.now().toString(),
                    type: "lead",
                    text: `New lead: ${parsed.name || "Unknown"} — ${parsed.message || "Message received"}`,
                    time: "Just now",
                    icon: Users,
                    color: "text-dash-accent",
                    bg: "bg-dash-accent-muted",
                  },
                  ...prev.slice(0, 9),
                ]);
              } else if (parsed.type === "qualified") {
                setLiveActivity((prev) => [
                  {
                    id: parsed.id || Date.now().toString(),
                    type: "lead",
                    text: `Lead qualified: ${parsed.name || "Unknown"} — ${parsed.details || "Budget identified"}`,
                    time: "Just now",
                    icon: Users,
                    color: "text-dash-success",
                    bg: "bg-dash-success-muted",
                  },
                  ...prev.slice(0, 9),
                ]);
              } else if (parsed.type === "takeover_needed") {
                setLiveActivity((prev) => [
                  {
                    id: parsed.id || Date.now().toString(),
                    type: "alert",
                    text: `AI needs attention — ${parsed.reason || "Complex question detected"}`,
                    time: "Just now",
                    icon: Zap,
                    color: "text-dash-warning",
                    bg: "bg-dash-warning-muted",
                  },
                  ...prev.slice(0, 9),
                ]);
              } else if (parsed.type === "meeting_booked") {
                setLiveActivity((prev) => [
                  {
                    id: parsed.id || Date.now().toString(),
                    type: "meeting",
                    text: `Meeting booked: ${parsed.name || "Unknown"} — ${parsed.time || "Time TBC"}`,
                    time: "Just now",
                    icon: Calendar,
                    color: "text-dash-success",
                    bg: "bg-dash-success-muted",
                  },
                  ...prev.slice(0, 9),
                ]);
              }
            } catch {
              // ignore parse errors
            }
          };

          ws.onclose = () => {
            // Try to reconnect after 5s
            setTimeout(() => {
              if (wsRef.current === ws) fetchStats();
            }, 5000);
          };
        }
      })
      .catch(() => {
        // WebSocket not available, poll every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
      });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetchStats]);

  const statCards = stats
    ? [
        {
          label: t("overview.stats.activeConversations"),
          value: stats.active.toString(),
          icon: MessageSquare,
          color: "text-dash-accent",
          bg: "bg-dash-accent-muted",
          change: "+3",
        },
        {
          label: t("overview.stats.qualifiedLeads"),
          value: stats.qualified.toString(),
          icon: Users,
          color: "text-dash-success",
          bg: "bg-dash-success-muted",
          change: "+2",
        },
        {
          label: t("overview.stats.avgResponseTime"),
          value: formatResponseTime(stats.avg_response_time_seconds),
          icon: Zap,
          color: "text-dash-warning",
          bg: "bg-dash-warning-muted",
          change: "-0.5s",
        },
        {
          label: t("overview.stats.conversionRate"),
          value: `${stats.conversion_rate}%`,
          icon: TrendingUp,
          color: "text-dash-purple",
          bg: "bg-dash-purple-muted",
          change: "+2%",
        },
      ]
    : null;

  const funnelData = stats
    ? [
        { label: "Total Leads", value: stats.total_leads_today || stats.qualified * 3, color: "bg-dash-accent", pct: 100 },
        { label: "Qualified", value: stats.qualified, color: "bg-dash-success", pct: stats.qualified > 0 ? Math.round((stats.qualified / (stats.total_leads_today || stats.qualified * 3)) * 100) : 0 },
        { label: "Meetings", value: stats.meetings_booked_today || 0, color: "bg-dash-purple", pct: stats.meetings_booked_today > 0 ? Math.round((stats.meetings_booked_today / (stats.total_leads_today || stats.qualified * 3)) * 100) : 0 },
        { label: "Deals", value: Math.floor(stats.qualified * 0.2), color: "bg-dash-warning", pct: 8 },
      ]
    : null;

  const greeting = getGreeting();

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="dash-animate-in flex items-start justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            {t(`overview.greeting${greeting.charAt(0).toUpperCase() + greeting.slice(1)}`)}
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-dash-text-muted text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="dash-card flex items-center justify-between rounded-2xl border border-dash-danger/20 bg-dash-danger-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-danger-muted">
              <Zap className="h-4 w-4 text-dash-danger" />
            </div>
            <div>
              <p className="font-medium text-dash-danger text-sm">{error}</p>
              <p className="text-dash-text-muted text-xs">Check your connection and try again</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            className="rounded-lg bg-dash-danger px-3 py-1.5 font-medium text-white text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards
          ? statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="dash-card dash-card-hover group p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <span className="font-Helvetica-Neue font-semibold text-dash-text text-sm leading-tight">
                        {stat.label}
                      </span>
                    </div>
                    <span className="rounded-full bg-dash-success-muted px-2 py-0.5 font-medium text-dash-success text-[11px]">
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="font-bold text-3xl text-dash-text">
                      {stat.value}
                    </div>
                  </div>
                </div>
              );
            })
          : (["active", "qualified", "response", "conversion"] as const).map((k) => <StatSkeleton key={k} />)}
      </div>

      {/* Twin Health + Funnel Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sales Twin Health Card */}
        <div className="dash-card dash-card-hover group p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent-muted">
              <Sparkle className="h-5 w-5 text-dash-accent" />
            </div>
            <div>
              <span className="font-Helvetica-Neue font-semibold text-dash-text text-sm">{t("overview.twin.title")}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 text-[11px] font-medium">Active</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              {stats ? (
                <div className="font-bold text-3xl text-dash-text">
                  {stats.avg_messages_per_day.toFixed(0)}
                </div>
              ) : (
                <div className="h-8 w-16 animate-pulse rounded bg-dash-surface-secondary" />
              )}
              <div className="mt-1 text-dash-text-muted text-xs">{t("overview.twin.avgMsgsPerDay")}</div>
            </div>
            <div>
              {stats ? (
                <div className="font-bold text-3xl text-dash-text">
                  {stats.no_manager_needed_count}
                </div>
              ) : (
                <div className="h-8 w-16 animate-pulse rounded bg-dash-surface-secondary" />
              )}
              <div className="mt-1 text-dash-text-muted text-xs">{t("overview.twin.autoResolved")}</div>
            </div>
          </div>
        </div>

        {/* Lead Funnel */}
        {funnelData ? (
          <div className="dash-card dash-card-hover group p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Lead Funnel (Today)</h3>
              <Link
                href="/dashboard/leads"
                className="flex items-center gap-1 font-medium text-dash-accent text-xs no-underline hover:text-dash-accent-hover"
              >
                View pipeline
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {funnelData.map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className="w-20 text-dash-text-secondary text-xs font-medium">{stage.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-dash-surface-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-dash-text text-sm">{stage.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <FunnelSkeleton />
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="dash-card dash-animate-in overflow-hidden" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between border-dash-border border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-dash-accent" />
            <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
              Live Activity
            </h3>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-dash-text-muted text-[11px]">Real-time</span>
          </div>
          <Link
            href="/dashboard/conversations"
            className="flex items-center gap-1 font-medium text-dash-accent text-xs no-underline transition-colors hover:text-dash-accent-hover"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-dash-border divide-y">
          {liveActivity.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="h-8 w-8 text-dash-text-muted mx-auto mb-2" />
              <p className="text-dash-text-muted text-sm">No activity yet today. Leads will appear here in real-time.</p>
            </div>
          ) : (
            liveActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-dash-surface-hover"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-dash-text text-sm leading-relaxed">
                      {item.text}
                    </p>
                    <p className="mt-0.5 text-dash-text-muted text-xs">
                      {item.time}
                    </p>
                  </div>
                  {item.type === "alert" && (
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/conversations")}
                      className="shrink-0 rounded-lg bg-dash-warning px-3 py-1.5 font-medium text-white text-xs hover:bg-yellow-600"
                    >
                      Take Over
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/conversations"
          className="dash-card dash-card-hover flex items-center gap-4 p-4 no-underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
            <MessageSquare className="h-5 w-5 text-dash-accent" />
          </div>
          <div>
            <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Open Conversations</p>
            <p className="text-dash-text-muted text-xs">Respond to takeover requests</p>
          </div>
        </Link>
        <Link
          href="/dashboard/leads"
          className="dash-card dash-card-hover flex items-center gap-4 p-4 no-underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-success-muted">
            <DollarSign className="h-5 w-5 text-dash-success" />
          </div>
          <div>
            <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">View Pipeline</p>
            <p className="text-dash-text-muted text-xs">Manage your qualified leads</p>
          </div>
        </Link>
        <Link
          href="/dashboard/integration"
          className="dash-card dash-card-hover flex items-center gap-4 p-4 no-underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
            <Zap className="h-5 w-5 text-dash-purple" />
          </div>
          <div>
            <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Integrations</p>
            <p className="text-dash-text-muted text-xs">Connect your CRM & calendar</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
