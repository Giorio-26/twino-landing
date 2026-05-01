"use client";

import {
  ArrowUpRight,
  LogOut,
  MessageSquare,
  Sparkle,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

interface DashboardStats {
  active: number;
  qualified: number;
  conversion_rate: number;
  avg_response_time_seconds: number;
  avg_messages_per_day: number;
  no_manager_needed_count: number;
  avg_communications_per_day: number;
}

function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

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

type GreetingKey = "greetingMorning" | "greetingAfternoon" | "greetingEvening";

export default function DashboardOverview() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [greetingKey, setGreetingKey] = useState<GreetingKey>("greetingMorning");

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});

    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreetingKey("greetingAfternoon");
    else if (hour >= 18 || hour < 5) setGreetingKey("greetingEvening");
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/dashboard/sign-out", { method: "POST" });
    router.push("/dashboard/access");
    router.refresh();
  };

  const statCards = stats
    ? [
        {
          label: t("overview.stats.activeConversations"),
          value: stats.active.toString(),
          icon: MessageSquare,
          color: "text-dash-accent",
          bg: "bg-dash-accent-muted",
        },
        {
          label: t("overview.stats.qualifiedLeads"),
          value: stats.qualified.toString(),
          icon: Users,
          color: "text-dash-success",
          bg: "bg-dash-success-muted",
        },
        {
          label: t("overview.stats.avgResponseTime"),
          value: formatResponseTime(stats.avg_response_time_seconds),
          icon: Zap,
          color: "text-dash-warning",
          bg: "bg-dash-warning-muted",
        },
        {
          label: t("overview.stats.conversionRate"),
          value: formatPercent(stats.conversion_rate),
          icon: TrendingUp,
          color: "text-dash-purple",
          bg: "bg-dash-purple-muted",
        },
      ]
    : null;

  return (
    <div className="mx-auto w-full space-y-8">
      {/* Header */}
      <div className="dash-animate-in flex items-start justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            {t(`overview.${greetingKey}`)}
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            {t("overview.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-dash-text-muted text-sm transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t("sidebar.signOut")}</span>
        </button>
      </div>

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

      {/* Sales Twin Card */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dash-card dash-card-hover group p-5 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent-muted">
              <Sparkle className="h-5 w-5 text-dash-accent" />
            </div>
            <span className="font-Helvetica-Neue font-semibold text-dash-text text-sm">{t("overview.twin.title")}</span>
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
              <div className="mt-1 text-dash-text-muted text-sm">{t("overview.twin.avgMsgsPerDay")}</div>
            </div>
            <div>
              {stats ? (
                <div className="font-bold text-3xl text-dash-text">
                  {stats.no_manager_needed_count}
                </div>
              ) : (
                <div className="h-8 w-16 animate-pulse rounded bg-dash-surface-secondary" />
              )}
              <div className="mt-1 text-dash-text-muted text-sm">{t("overview.twin.autoResolved")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="dash-card dash-animate-in p-6"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/conversations"
            className="flex items-center gap-1 font-medium text-dash-accent text-xs no-underline transition-colors hover:text-dash-accent-hover"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="relative overflow-hidden">
          <div className="space-y-1">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-dash-surface-hover"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-surface-secondary ${item.color}`}
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
                </div>
              );
            })}
          </div>

          {/* Coming Soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <span className="rounded-full bg-dash-surface px-4 py-1.5 font-semibold text-dash-text text-sm shadow-sm ring-1 ring-black/5">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
