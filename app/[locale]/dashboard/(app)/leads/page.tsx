"use client";

import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Check,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Sparkle,
  Target,
  User,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Lead {
  id: number;
  company_id: string;
  chat_id: string;
  customer_name: string | null;
  budget: string | null;
  location: string | null;
  selected_property: string | null;
  intent: string | null;
  lead_score: number | null;
  status: "new" | "hot" | "qualified" | "call_in" | "deal";
  created_at: string;
  updated_at: string;
}

const STATUSES = ["new", "hot", "qualified", "call_in", "deal"] as const;
type Status = (typeof STATUSES)[number];

// Backend statuses mapped to MVP front-end filter labels (spec filters)
const STATUS_FILTER_LABELS: Record<Status, string> = {
  new: "New",
  hot: "Needs Attention",
  qualified: "Qualified",
  call_in: "Qualifying",
  deal: "Converted",
};

const statusColors: Record<Status, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-dash-accent-muted", text: "text-dash-accent", dot: "bg-dash-accent" },
  hot: { bg: "bg-dash-danger-muted", text: "text-dash-danger", dot: "bg-dash-danger" },
  qualified: { bg: "bg-dash-success-muted", text: "text-dash-success", dot: "bg-dash-success" },
  call_in: { bg: "bg-dash-purple-muted", text: "text-dash-purple", dot: "bg-dash-purple" },
  deal: { bg: "bg-teal-500/10", text: "text-teal-600", dot: "bg-teal-500" },
};

function extractPhone(chatId: string): string {
  const raw = chatId.split("@")[0];
  return `+${raw}`;
}

function getDisplayName(lead: Lead): string {
  if (lead.customer_name && lead.customer_name !== "უცნობია") return lead.customer_name;
  return extractPhone(lead.chat_id);
}

function getInitials(lead: Lead): string {
  const name = getDisplayName(lead);
  if (name.startsWith("+")) {
    const digits = name.replace(/\D/g, "");
    return digits.slice(-2);
  }
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(iso: string): string {
  const utc = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  const diff = Date.now() - new Date(utc).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(iso: string): string {
  const utc = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  return new Date(utc).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Simple, instantly-readable score label. No complex AI scoring. */
function scoreLevel(score: number | null): "High" | "Medium" | "Low" | null {
  if (score == null) return null;
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

/** Channel guess from chat_id suffix. Backend carries no explicit source column yet. */
function guessSource(chatId: string): string {
  if (chatId.endsWith("@s.whatsapp.net") || chatId.includes("whatsapp")) return "WhatsApp";
  if (chatId.endsWith("@messaging") || chatId.includes("messenger")) return "Messenger";
  if (chatId.endsWith("@instagram") || chatId.includes("instagram")) return "Instagram";
  return "Inbox";
}

export default function LeadsPage() {
  const t = useTranslations("dashboard.leads");
  const tConvo = useTranslations("dashboard.conversations");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "lead_score" | "created_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [exporting, setExporting] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Detail drawer
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  // Inline status update
  const [inlineStatusUpdating, setInlineStatusUpdating] = useState<number | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("q", debouncedSearch);
        if (statusFilter !== "all") params.set("status", statusFilter);
        params.set("sort", sortBy);
        params.set("dir", sortDir);
        const res = await fetch(`/api/dashboard/leads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load leads");
        const json = await res.json();
        setLeads(json.data ?? []);
      } catch {
        setError("Could not load leads. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [debouncedSearch, statusFilter, sortBy, sortDir]);

  const statCounts = {
    total: leads.length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    deal: leads.filter((l) => l.status === "deal").length,
    newCount: leads.filter((l) => l.status === "new").length,
    needsAttention: leads.filter((l) => l.status === "hot").length,
  };

  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < leads.length;

  function toggleSelectAll() {
    setSelectedIds(isAllSelected ? new Set() : new Set(leads.map((l) => l.id)));
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkStatus(status: Status) {
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/dashboard/leads/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLeads((prev) =>
        prev.map((l) => {
          const updated = json.data?.find((u: Lead) => u.id === l.id);
          return updated ?? l;
        }),
      );
      setSelectedIds(new Set());
      setBulkStatusOpen(false);
    } catch {
      // keep dropdown open for retry
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleInlineStatus(leadId: number, status: Status) {
    setInlineStatusUpdating(leadId);
    try {
      const res = await fetch(`/api/dashboard/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated: Lead = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      if (drawerLead?.id === leadId) setDrawerLead({ ...drawerLead, ...updated });
    } catch {
      // silent
    } finally {
      setInlineStatusUpdating(null);
    }
  }

  const toggleSort = (col: "updated_at" | "lead_score" | "created_at") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="dash-animate-in flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">{t("pageTitle")}</h2>
          <p className="mt-1 text-dash-text-secondary text-sm">{t("pageSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                const res = await fetch("/api/dashboard/leads/export");
                if (!res.ok) throw new Error();
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "leads.csv";
                anchor.click();
                URL.revokeObjectURL(url);
              } finally {
                setExporting(false);
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 font-medium text-dash-text-secondary text-sm no-underline transition-colors hover:bg-dash-surface-hover hover:text-dash-text disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? t("exporting") : t("export")}
          </button>
          <a
            href="/dashboard/leads/new"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white text-sm shadow-accent/25 shadow-md no-underline transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            <User className="h-4 w-4" />
            {t("addLead")}
          </a>
        </div>
      </div>

      {/* KPI mini-stats */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-5">
        <KpiStat label={t("stats.total")} value={statCounts.total} icon={Users} bg="bg-dash-surface-secondary" color="text-dash-text-secondary" />
        <KpiStat label={t("stats.new")} value={statCounts.newCount} icon={Target} bg="bg-dash-accent-muted" color="text-dash-accent" />
        <KpiStat label={t("stats.qualified")} value={statCounts.qualified} icon={Check} bg="bg-dash-success-muted" color="text-dash-success" />
        <KpiStat label={t("stats.needsAttention")} value={statCounts.needsAttention} icon={Clock} bg="bg-dash-danger-muted" color="text-dash-danger" />
        <KpiStat label={t("stats.converted")} value={statCounts.deal} icon={User} bg="bg-dash-purple-muted" color="text-dash-purple" />
      </div>

      {/* Toolbar */}
      <div className="dash-animate-in" style={{ animationDelay: "0.15s" }}>
        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="dash-card mb-3 flex flex-wrap items-center justify-between gap-3 border-dash-accent/20 border bg-dash-accent-muted/40 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-dash-accent px-1.5 font-bold text-[11px] text-white">
                {selectedIds.size}
              </span>
              <span className="font-medium text-dash-text text-sm">{t("selectedCount", { count: selectedIds.size })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-dash-accent px-3 py-1.5 font-medium text-white text-xs disabled:opacity-50"
                >
                  {bulkActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {t("changeStatus")}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {bulkStatusOpen && (
                  <div className="dash-animate-scale absolute right-0 z-30 mt-1 w-48 rounded-xl border border-dash-border bg-dash-surface p-1 shadow-lg">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleBulkStatus(s)}
                        disabled={bulkActionLoading}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-dash-surface-hover"
                      >
                        <span className={`h-2 w-2 rounded-full ${statusColors[s].dot}`} />
                        <span className={`font-medium ${statusColors[s].text}`}>{STATUS_FILTER_LABELS[s]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-lg px-3 py-1.5 font-medium text-dash-text-muted text-xs hover:bg-dash-surface-hover"
              >
                {t("clearSelection")}
              </button>
            </div>
          </div>
        )}

        {/* Search + filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-dash-border bg-white py-2.5 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
              showFilters
                ? "bg-dash-accent-muted text-dash-accent"
                : "border border-dash-border text-dash-text-muted hover:bg-dash-surface-hover"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {t("filters")}
          </button>
          {showFilters && (
            <div className="dash-animate-in flex flex-wrap gap-2">
              {(
                [
                  { key: "all", label: t("filterAll") },
                  { key: "new", label: t("filterNew") },
                  { key: "call_in", label: t("filterQualifying") },
                  { key: "qualified", label: t("filterQualified") },
                  { key: "hot", label: t("filterNeedsAttention") },
                  { key: "deal", label: t("filterConverted") },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key as typeof statusFilter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === f.key
                      ? "bg-dash-accent-muted text-dash-accent ring-1 ring-dash-accent/20"
                      : "border border-dash-border text-dash-text-muted hover:bg-dash-surface-hover"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.2s" }}
      >
        {error ? (
          <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); }} />
        ) : loading ? (
          <div className="px-5 py-16 text-center">
            <div className="inline-flex items-center gap-2 text-dash-text-muted text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leads…
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dash-surface-secondary">
              <Users className="h-7 w-7 text-dash-text-muted" />
            </div>
            <p className="font-Helvetica-Neue font-bold text-dash-text text-lg">{tConvo("empty.title")}</p>
            <p className="max-w-md text-dash-text-muted text-sm">{tConvo("empty.description")}</p>
            <a
              href="/dashboard/integration"
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 font-medium text-white text-xs no-underline hover:bg-accent-hover"
            >
              {tConvo("empty.cta")}
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-dash-border border-b bg-dash-surface-secondary/30">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-dash-border accent-dash-accent"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader active={sortBy === "created_at"} dir={sortDir} onSort={() => toggleSort("created_at")}>
                      {t("columns.lead")}
                    </SortHeader>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.source")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.property")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.budget")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.intent")}
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader active={sortBy === "lead_score"} dir={sortDir} onSort={() => toggleSort("lead_score")}>
                      {t("columns.score")}
                    </SortHeader>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.status")}
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader active={sortBy === "updated_at"} dir={sortDir} onSort={() => toggleSort("updated_at")}>
                      {t("columns.lastActivity")}
                    </SortHeader>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    {t("columns.owner")}
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const initials = getInitials(lead);
                  const colors = statusColors[lead.status] ?? statusColors.new;
                  const name = getDisplayName(lead);
                  const level = scoreLevel(lead.lead_score);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setDrawerLead(lead)}
                      className={`cursor-pointer border-dash-border border-b transition-colors ${
                        selectedIds.has(lead.id) ? "bg-dash-accent-muted/10" : "hover:bg-dash-surface-hover"
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="h-4 w-4 rounded border-dash-border accent-dash-accent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                              lead.customer_name
                                ? "bg-gradient-to-br from-accent/20 to-purple-500/10 text-dash-accent"
                                : "bg-dash-surface-secondary text-dash-text"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="text-dash-text text-sm font-medium">{name}</div>
                            <div className="mt-0.5 text-dash-text-muted text-xs">{extractPhone(lead.chat_id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-dash-text-secondary text-sm">
                        {guessSource(lead.chat_id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-dash-text-secondary text-sm">
                        {lead.selected_property ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-dash-text-muted" />
                            {lead.selected_property}
                          </span>
                        ) : (
                          <span className="text-dash-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-dash-text text-sm font-semibold">
                        {lead.budget ?? <span className="text-dash-text-muted font-normal">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize text-dash-text-secondary text-sm">
                        {lead.intent ?? <span className="text-dash-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {level ? <ScoreBadge level={level} score={lead.lead_score!} /> : <span className="text-dash-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold hover:ring-1 hover:ring-current/20 disabled:opacity-50"
                        >
                          {inlineStatusUpdating === lead.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <span className={`mr-1.5 h-1.5 w-1.5 self-center rounded-full ${colors.dot}`} />
                              <InlineStatusSelect
                                current={lead.status}
                                colors={colors}
                                onChange={(s) => handleInlineStatus(lead.id, s)}
                              />
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-dash-text-muted text-xs">{timeAgo(lead.updated_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-dash-text-muted text-sm">—</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerLead && (
        <LeadDrawer
          lead={drawerLead}
          onClose={() => setDrawerLead(null)}
          onUpdateStatus={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setDrawerLead(updated);
          }}
          inlineUpdating={inlineStatusUpdating}
          setInlineUpdating={setInlineStatusUpdating}
        />
      )}
    </div>
  );
}

function SortHeader({
  children,
  active,
  dir,
  onSort,
}: {
  children: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  onSort: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSort}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-dash-text-muted hover:text-dash-text"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${active ? "text-dash-accent" : ""}`} />
      {active && <span className="sr-only">{dir === "asc" ? "ascending" : "descending"}</span>}
    </button>
  );
}

function KpiStat({
  label,
  value,
  icon: Icon,
  bg,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  bg: string;
  color: string;
}) {
  return (
    <div className="dash-card flex items-center gap-4 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <div className="text-dash-text text-2xl font-bold">{value}</div>
        <div className="text-dash-text-muted text-xs">{label}</div>
      </div>
    </div>
  );
}

function ScoreBadge({ level, score }: { level: "High" | "Medium" | "Low"; score: number }) {
  const style =
    level === "High"
      ? "bg-dash-success-muted text-dash-success"
      : level === "Medium"
        ? "bg-dash-warning-muted text-dash-warning"
        : "bg-dash-surface-secondary text-dash-text-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          level === "High" ? "bg-dash-success" : level === "Medium" ? "bg-dash-warning" : "bg-dash-text-muted"
        }`}
      />
      {level}
      <span className="opacity-60">{score}/10</span>
    </span>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-danger-muted">
        <X className="h-6 w-6 text-dash-danger" />
      </div>
      <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-dash-danger px-4 py-2 font-medium text-white text-xs"
      >
        Retry
      </button>
    </div>
  );
}

function InlineStatusSelect({
  current,
  colors,
  onChange,
}: {
  current: Status;
  colors: { text: string };
  onChange: (s: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 font-medium ${colors.text}`}
      >
        {STATUS_FILTER_LABELS[current]}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} aria-hidden />
          <span className="dash-animate-scale absolute right-0 z-20 mt-1 w-44 rounded-xl border border-dash-border bg-dash-surface p-1 shadow-lg">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-dash-surface-hover"
              >
                <span className={`h-2 w-2 rounded-full ${statusColors[s].dot}`} />
                <span className={`font-medium ${statusColors[s].text}`}>{STATUS_FILTER_LABELS[s]}</span>
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

function LeadDrawer({
  lead,
  onClose,
  onUpdateStatus,
  inlineUpdating,
  setInlineUpdating,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (updated: Lead) => void;
  inlineUpdating: number | null;
  setInlineUpdating: (id: number | null) => void;
}) {
  const t = useTranslations("dashboard.leads");

  async function handleStatus(status: Status) {
    setInlineUpdating(lead.id);
    try {
      const res = await fetch(`/api/dashboard/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated: Lead = await res.json();
      onUpdateStatus(updated);
    } catch {
      // silent
    } finally {
      setInlineUpdating(null);
    }
  }

  const name = getDisplayName(lead);
  const level = scoreLevel(lead.lead_score);
  const known = (v: string | null | undefined) => !!v && v !== "უცნობია";

  const summaryItems = [
    { label: "Budget", value: lead.budget, icon: "budget" },
    { label: "Preferred location", value: lead.location, icon: "location" },
    { label: "Property type", value: lead.selected_property, icon: "property" },
    { label: "Intent", value: lead.intent, icon: "intent" },
  ];

  const hasQualification = summaryItems.some((i) => known(i.value));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="dash-animate-slide relative z-10 flex h-full w-full max-w-md flex-col border-dash-border border-l bg-dash-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-dash-border border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                lead.customer_name
                  ? "bg-gradient-to-br from-accent/20 to-purple-500/10 text-dash-accent"
                  : "bg-dash-surface-secondary text-dash-text"
              }`}
            >
              {getInitials(lead)}
            </div>
            <div>
              <h3 className="font-Helvetica-Neue text-base font-bold text-dash-text">{name}</h3>
              <p className="text-dash-text-muted text-xs">
                {extractPhone(lead.chat_id)} · {guessSource(lead.chat_id)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
          {/* AI Qualification Summary */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-accent" />
              <h4 className="font-Helvetica-Neue text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                {t("detail.qualification")}
              </h4>
            </div>
            {hasQualification ? (
              <div className="rounded-2xl border border-dash-success/25 bg-dash-success-muted/40 p-4">
                <ul className="space-y-2.5">
                  {summaryItems.map((item) => (
                    <li key={item.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-dash-text-muted">{item.label}</span>
                      <span className={`font-semibold text-right text-dash-text ${known(item.value) ? "" : "text-dash-text-muted"}`}>
                        {known(item.value) ? item.value : "Not yet collected"}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center gap-1.5 pt-1.5 text-xs font-medium text-dash-success">
                    <Check className="h-3.5 w-3.5" />
                    {lead.status === "qualified" || lead.status === "deal"
                      ? "Recommended: follow up within 15 minutes"
                      : "Twin is still collecting qualification details"}
                  </li>
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-dash-border bg-dash-surface-secondary/50 p-4 text-center">
                <p className="text-dash-text-muted text-xs">{t("detail.qualificationEmpty")}</p>
              </div>
            )}
          </div>

          {/* Score */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dash-text-muted">Lead Score</h4>
            <div className="rounded-xl bg-dash-surface-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-dash-text-secondary text-sm">Quality</span>
                <span className="flex items-center gap-2">
                  {level && <ScoreBadge level={level} score={lead.lead_score!} />}
                  <span className="text-dash-accent text-xl font-bold">{lead.lead_score ?? "—"}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-dash-accent-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    (lead.lead_score ?? 0) >= 7
                      ? "bg-dash-success"
                      : (lead.lead_score ?? 0) >= 4
                        ? "bg-dash-warning"
                        : "bg-dash-text-muted"
                  }`}
                  style={{ width: `${((lead.lead_score ?? 0) / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
              {t("detail.contactInfo")}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-dash-surface-secondary px-3 py-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-dash-text-muted" />
                <a href={`tel:${extractPhone(lead.chat_id)}`} className="font-medium text-dash-text no-underline hover:text-dash-accent">
                  {extractPhone(lead.chat_id)}
                </a>
              </div>
              {known(lead.location) && (
                <div className="flex items-center gap-2 rounded-lg bg-dash-surface-secondary px-3 py-2 text-sm text-dash-text">
                  <MapPin className="h-3.5 w-3.5 text-dash-text-muted" />
                  {lead.location}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dash-text-muted">Pipeline Status</h4>
            <div className="flex flex-wrap items-center gap-2">
              {STATUSES.map((s) => {
                const c = statusColors[s];
                const isActive = lead.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatus(s)}
                    disabled={inlineUpdating === lead.id}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? `${c.bg} ${c.text} ring-1 ring-current/20`
                        : "border border-dash-border text-dash-text-muted hover:bg-dash-surface-hover"
                    }`}
                  >
                    {inlineUpdating === lead.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    )}
                    {STATUS_FILTER_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dash-text-muted">Activity Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-accent-muted">
                  <MessageSquare className="h-3.5 w-3.5 text-dash-accent" />
                </div>
                <div>
                  <p className="text-dash-text text-sm">Lead created</p>
                  <p className="text-dash-text-muted text-xs">{formatDate(lead.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-success-muted">
                  <Check className="h-3.5 w-3.5 text-dash-success" />
                </div>
                <div>
                  <p className="text-dash-text text-sm">Last activity</p>
                  <p className="text-dash-text-muted text-xs">{timeAgo(lead.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 border-dash-border border-t px-6 py-4">
          <a
            href={`tel:${extractPhone(lead.chat_id)}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 text-sm font-semibold text-white hover:bg-dash-accent-hover"
          >
            <Phone className="h-4 w-4" />
            Call {name}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${lead.chat_id.split("@")[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 text-sm font-semibold text-dash-text-secondary hover:bg-dash-surface-hover"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 text-sm font-semibold text-dash-text-secondary hover:bg-dash-surface-hover"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
