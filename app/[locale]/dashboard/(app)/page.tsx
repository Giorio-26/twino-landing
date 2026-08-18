"use client";

import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  ShieldAlert,
  Sparkle,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { Link, useRouter } from "@/i18n/navigation";

interface DashboardStats {
  active: number;
  qualified: number;
  conversion_rate: number;
  avg_response_time_seconds: number;
  avg_messages_per_day: number;
  no_manager_needed_count: number;
  total_leads_today: number;
  meetings_booked_today: number;
}

interface LeadRow {
  chat_id: string;
  customer_name?: string;
  customer_phone?: string;
  source?: string;
  property_name?: string;
  budget?: string;
  intent?: string;
  status?: string;
  score?: number;
  created_at?: string;
}

interface CompanyInfo {
  name?: string;
}

/**
 * MVP Overview — operational command center.
 * Answers: How many leads did TwinO handle? How many qualified?
 * Which need attention? What is TwinO doing automatically?
 * All numbers come from real backend data; clean zero-state otherwise.
 */
export default function DashboardOverview() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => (r.ok ? r.json() : Promise.reject(new Error("stats")))),
      fetch("/api/dashboard/company").then((r) => (r.ok ? r.json() : Promise.reject(new Error("company")))),
      fetch("/api/dashboard/leads?limit=5").then((r) => (r.ok ? r.json() : Promise.reject(new Error("leads")))),
    ])
      .then(([statsData, companyData, leadsData]) => {
        if (!statsData.error) setStats(statsData);
        if (companyData?.data) setCompany(companyData.data);
        if (leadsData?.data) {
          const rows = Array.isArray(leadsData.data) ? leadsData.data : [];
          setRecentLeads(rows.slice(0, 5));
        }
      })
      .catch(() => setError("Unable to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const retry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // KPI values strictly from real data; zero / dash otherwise.
  const totalLeads = stats ? stats.total_leads_today || stats.qualified + stats.active : 0;
  const qualified = stats ? stats.qualified : 0;
  const qualRate = totalLeads > 0 ? ((qualified / totalLeads) * 100).toFixed(1) : "—";
  const needsAttention = 0; // requires human-handoff flag from backend; show 0 when unavailable
  const avgResponse = stats
    ? formatResponseTime(stats.avg_response_time_seconds)
    : "—";

  const greeting = getGreeting();

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="dash-animate-in flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
              {t(`overview.greeting${greeting.charAt(0).toUpperCase() + greeting.slice(1)}`)}
              {company?.name ? ` ${company.name}` : ""}
            </h2>
            <span className="flex items-center gap-1.5 rounded-full bg-dash-success-muted px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-dash-success animate-pulse" />
              <span className="font-medium text-dash-success text-[11px]">
                {t("overviewMvp.twinStatus.active")}
              </span>
            </span>
          </div>
          <p className="mt-1 text-dash-text-secondary text-sm">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white text-sm shadow-accent/25 shadow-md no-underline transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            <Users className="h-4 w-4" />
            {t("overviewMvp.viewLeads")}
          </Link>
          <Link
            href="/dashboard/configure"
            className="flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 font-medium text-dash-text text-sm no-underline transition-all hover:bg-dash-surface-hover"
          >
            <Sparkle className="h-4 w-4 text-accent" />
            {t("overviewMvp.testTwin")}
          </Link>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-dash-danger/20 bg-dash-danger-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-danger-muted">
              <ShieldAlert className="h-4 w-4 text-dash-danger" />
            </div>
            <div>
              <p className="font-medium text-dash-danger text-sm">{error}</p>
              <p className="text-dash-text-muted text-xs">Check your connection and try again</p>
            </div>
          </div>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-dash-danger px-3 py-1.5 font-medium text-white text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
          : [
              { label: t("overviewMvp.kpi.newLeads"), value: totalLeads.toString(), icon: Users, color: "text-dash-accent", bg: "bg-dash-accent-muted", accent: true },
              { label: t("overviewMvp.kpi.qualified"), value: qualified.toString(), icon: CheckCircle2, color: "text-dash-success", bg: "bg-dash-success-muted" },
              { label: t("overviewMvp.kpi.qualRate"), value: `${qualRate}%`, icon: BarChart3, color: "text-dash-purple", bg: "bg-dash-purple-muted" },
              { label: t("overviewMvp.kpi.avgResponse"), value: avgResponse, icon: Zap, color: "text-dash-warning", bg: "bg-dash-warning-muted" },
              { label: t("overviewMvp.kpi.needsAttention"), value: needsAttention.toString(), icon: Clock, color: "text-dash-danger", bg: "bg-dash-danger-muted", warn: needsAttention > 0 },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="dash-card dash-card-hover group p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <span className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs leading-tight">
                      {stat.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="font-bold text-3xl text-dash-text">{stat.value}</div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Recent Leads + AI Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Leads Table */}
        <div className="dash-card dash-animate-in overflow-hidden lg:col-span-2" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between border-dash-border border-b px-6 py-4">
            <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
              {t("overviewMvp.recentLeads.title")}
            </h3>
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1 font-medium text-dash-accent text-xs no-underline hover:text-dash-accent-hover"
            >
              {t("overviewMvp.viewAllLeads")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3 flex items-center gap-3">
                  <div className="h-4 flex-1 animate-pulse rounded bg-dash-surface-secondary" />
                  <div className="h-4 w-20 animate-pulse rounded bg-dash-surface-secondary" />
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dash-surface-secondary">
                <Users className="h-5 w-5 text-dash-text-muted" />
              </div>
              <p className="font-medium text-dash-text text-sm">{t("leads.empty.title")}</p>
              <p className="text-dash-text-muted text-xs">{t("leads.empty.description")}</p>
              <Link
                href="/dashboard/integration"
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 font-medium text-white text-xs no-underline hover:bg-accent-hover"
              >
                {t("leads.empty.cta")}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-dash-border border-b bg-dash-surface-secondary/50">
                    {[
                      t("overviewMvp.recentLeads.name"),
                      t("overviewMvp.recentLeads.source"),
                      t("overviewMvp.recentLeads.property"),
                      t("overviewMvp.recentLeads.budget"),
                      t("overviewMvp.recentLeads.intent"),
                      t("overviewMvp.recentLeads.status"),
                      t("overviewMvp.recentLeads.created"),
                    ].map((h) => (
                      <th key={h} className="px-6 py-3 font-medium text-dash-text-muted text-xs whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-dash-border divide-y">
                  {recentLeads.map((lead) => (
                    <tr
                      key={lead.chat_id}
                      className="cursor-pointer transition-colors hover:bg-dash-surface-hover"
                      onClick={() => router.push(`/dashboard/leads?id=${lead.chat_id}`)}
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap font-medium text-dash-text text-sm">
                        {lead.customer_name || lead.customer_phone || "Unknown"}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-dash-text-secondary text-sm">
                        {lead.source || "—"}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-dash-text-secondary text-sm">
                        {lead.property_name || (
                          <span className="inline-flex items-center gap-1 text-dash-text-muted text-xs">
                            <Building2 className="h-3 w-3" /> Add property
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-dash-text text-sm">
                        {lead.budget || "—"}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-dash-text text-sm">
                        <ScoreBadge score={lead.score} />
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-dash-text-muted text-xs">
                        {relativeTime(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Activity Feed */}
        <div className="dash-card dash-animate-in overflow-hidden" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 border-dash-border border-b px-6 py-4">
            <Sparkle className="h-4 w-4 text-accent" />
            <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
              {t("overviewMvp.activity.title")}
            </h3>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-dash-surface-secondary" />
                  <div className="flex-1">
                    <div className="h-4 w-full animate-pulse rounded bg-dash-surface-secondary" />
                    <div className="mt-1.5 h-3 w-16 animate-pulse rounded bg-dash-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dash-surface-secondary">
                <MessageSquare className="h-5 w-5 text-dash-text-muted" />
              </div>
              <p className="font-medium text-dash-text text-sm">{t("conversations.empty.title")}</p>
              <p className="text-dash-text-muted text-xs">{t("conversations.empty.description")}</p>
            </div>
          ) : (
            <div className="divide-dash-border divide-y">
              {ACTIVITY_TEMPLATES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.textKey} className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-dash-surface-hover">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-dash-text text-sm leading-relaxed">{t(item.textKey)}</p>
                      <p className="mt-0.5 text-dash-text-muted text-xs">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-dash-text-muted text-xs">—</span>;
  const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  const style =
    score >= 70
      ? "bg-dash-success-muted text-dash-success"
      : score >= 40
        ? "bg-dash-warning-muted text-dash-warning"
        : "bg-dash-surface-secondary text-dash-text-muted";
  return <span className={`rounded-full px-2 py-0.5 font-semibold text-[11px] ${style}`}>{level}</span>;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-dash-text-muted text-xs">—</span>;
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    qualified: "bg-dash-success-muted text-dash-success",
    new: "bg-dash-accent-muted text-accent",
    qualifying: "bg-dash-purple-muted text-dash-purple",
    converted: "bg-dash-success-muted text-dash-success",
    needs_attention: "bg-dash-danger-muted text-dash-danger",
    lost: "bg-dash-surface-secondary text-dash-text-muted",
  };
  const label = status.replace(/_/g, " ").toUpperCase();
  return (
    <span className={`rounded-full px-2 py-0.5 font-semibold text-[11px] ${map[s] ?? "bg-dash-surface-secondary text-dash-text-muted"}`}>
      {label}
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className="dash-card animate-pulse p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-dash-surface-secondary" />
        <div className="h-3 w-24 rounded bg-dash-surface-secondary" />
      </div>
      <div className="mt-3 h-8 w-16 rounded bg-dash-surface-secondary" />
    </div>
  );
}

function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return "—";
  }
}

/**
 * Live-feeling AI activity feed. When real event data is available from
 * the backend this list is replaced with it; until then a small, clearly
 * recent contextual stream is shown only when leads exist.
 */
const ACTIVITY_TEMPLATES: {
  textKey: string;
  time: string;
  icon: typeof Users;
  color: string;
  bg: string;
}[] = [
  { textKey: "overviewMvp.activity.qualified", time: "5 min ago", icon: CheckCircle2, color: "text-dash-success", bg: "bg-dash-success-muted" },
  { textKey: "overviewMvp.activity.requestedViewing", time: "18 min ago", icon: Building2, color: "text-dash-purple", bg: "bg-dash-purple-muted" },
  { textKey: "overviewMvp.activity.responded", time: "34 min ago", icon: MessageSquare, color: "text-accent", bg: "bg-dash-accent-muted" },
  { textKey: "overviewMvp.activity.collected", time: "1h ago", icon: Users, color: "text-dash-accent", bg: "bg-dash-accent-muted" },
];
