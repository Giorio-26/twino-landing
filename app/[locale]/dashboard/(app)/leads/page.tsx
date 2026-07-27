"use client";

import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  Target,
  Trash2,
  User,
  Users,
  X,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  hot: "Hot",
  qualified: "Qualified",
  call_in: "Call In",
  deal: "Deal",
};

const statusColors: Record<Status, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-dash-accent-muted", text: "text-dash-accent", dot: "bg-dash-accent" },
  hot: { bg: "bg-dash-warning-muted", text: "text-dash-warning", dot: "bg-dash-warning" },
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
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
  return new Date(utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LeadsPage() {
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
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Inline status update
  const [inlineStatusUpdating, setInlineStatusUpdating] = useState<number | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
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
  };

  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < leads.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
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
          return updated ? updated : l;
        })
      );
      setSelectedIds(new Set());
      setBulkStatusOpen(false);
    } catch {
      // keep open for retry
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
      <div className="dash-animate-in flex items-start justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            Pipeline
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            Manage qualified prospects from your Sales Twin conversations.
          </p>
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
                const a = document.createElement("a");
                a.href = url;
                a.download = "leads.csv";
                a.click();
                URL.revokeObjectURL(url);
              } finally {
                setExporting(false);
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-dash-border px-4 py-2.5 font-medium text-dash-text-secondary text-sm transition-colors hover:bg-dash-surface-hover hover:text-dash-text disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-4">
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
            <User className="h-5 w-5 text-dash-accent" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.total}</div>
            <div className="text-dash-text-muted text-xs">Total Leads</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-warning-muted">
            <Target className="h-5 w-5 text-dash-warning" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.newCount}</div>
            <div className="text-dash-text-muted text-xs">New / Unqualified</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-success-muted">
            <Check className="h-5 w-5 text-dash-success" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.qualified}</div>
            <div className="text-dash-text-muted text-xs">Qualified</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
            <Users className="h-5 w-5 text-dash-purple" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.deal}</div>
            <div className="text-dash-text-muted text-xs">Deals Closed</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filters + Bulk Actions */}
      <div className="dash-animate-in" style={{ animationDelay: "0.15s" }}>
        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="dash-card mb-3 flex items-center justify-between bg-dash-accent-muted/40 border-dash-accent/20 border p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-dash-accent px-1.5 font-bold text-[11px] text-white">
                {selectedIds.size}
              </span>
              <span className="font-medium text-dash-text text-sm">leads selected</span>
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
                  Change Status
                  <ChevronDown className="h-3 w-3" />
                </button>
                {bulkStatusOpen && (
                  <div className="dash-animate-scale absolute right-0 z-30 mt-1 w-44 rounded-xl border border-dash-border bg-dash-surface p-1 shadow-lg">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleBulkStatus(s)}
                        disabled={bulkActionLoading}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-dash-surface-hover"
                      >
                        <span className={`h-2 w-2 rounded-full ${statusColors[s].dot}`} />
                        <span className={`font-medium ${statusColors[s].text}`}>{STATUS_LABELS[s]}</span>
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
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Search and filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, property..."
              className="w-full rounded-xl border border-dash-border bg-dash-surface py-2.5 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 font-medium text-xs transition-colors ${showFilters ? "bg-dash-accent-muted text-dash-accent" : "border border-dash-border text-dash-text-muted hover:bg-dash-surface-hover"}`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          {showFilters && (
            <div className="dash-animate-in flex flex-wrap gap-2">
              {(["all", ...STATUSES] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${statusFilter === s ? "bg-dash-accent-muted text-dash-accent ring-1 ring-dash-accent/20" : "border border-dash-border text-dash-text-muted hover:bg-dash-surface-hover"}`}
                >
                  {s !== "all" && <span className={`h-2 w-2 rounded-full ${statusColors[s as Status].dot}`} />}
                  {s === "all" ? "All" : STATUS_LABELS[s as Status]}
                  {s !== "all" && (
                    <span className="ml-0.5 text-dash-text-muted">
                      {leads.filter((l) => l.status === s).length}
                    </span>
                  )}
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
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-danger-muted mb-4">
              <X className="h-6 w-6 text-dash-danger" />
            </div>
            <p className="font-Helvetica-Neue font-semibold text-dash-text text-sm">{error}</p>
            <button
              type="button"
              onClick={() => { setError(null); setLoading(true); }}
              className="mt-3 rounded-lg bg-dash-danger px-4 py-2 text-white text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="px-5 py-16 text-center">
            <div className="inline-flex items-center gap-2 text-dash-text-muted text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leads…
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dash-surface-secondary mb-4">
              <Users className="h-7 w-7 text-dash-text-muted" />
            </div>
            <p className="font-Helvetica-Neue font-bold text-dash-text text-lg">No leads yet</p>
            <p className="mt-2 text-dash-text-muted text-sm max-w-md">
              Leads will appear here once the Sales Twin starts qualifying conversations.
              Make sure WhatsApp is connected in <span className="text-dash-accent font-medium">Integrations</span>.
            </p>
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
                      ref={(el) => { if (el) el.indeterminate = isSomeSelected; }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-dash-border accent-dash-accent"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort("created_at")} className="flex items-center gap-1 font-medium text-dash-text-muted text-xs uppercase tracking-wider hover:text-dash-text">
                      Contact
                      <ArrowUpDown className={`h-3 w-3 ${sortBy === "created_at" ? "text-dash-accent" : ""}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Intent</th>
                  <th className="px-4 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort("lead_score")} className="flex items-center gap-1 font-medium text-dash-text-muted text-xs uppercase tracking-wider hover:text-dash-text">
                      Score
                      <ArrowUpDown className={`h-3 w-3 ${sortBy === "lead_score" ? "text-dash-accent" : ""}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort("updated_at")} className="flex items-center gap-1 font-medium text-dash-text-muted text-xs uppercase tracking-wider hover:text-dash-text">
                      Activity
                      <ArrowUpDown className={`h-3 w-3 ${sortBy === "updated_at" ? "text-dash-accent" : ""}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const phone = extractPhone(lead.chat_id);
                  const initials = getInitials(lead);
                  const colors = statusColors[lead.status] ?? statusColors.new;
                  const name = getDisplayName(lead);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setDrawerLead(lead)}
                      className={`cursor-pointer border-dash-border border-b transition-colors ${selectedIds.has(lead.id) ? "bg-dash-accent-muted/10" : "hover:bg-dash-surface-hover"}`}
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
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold text-xs ${lead.customer_name ? "bg-gradient-to-br from-accent/20 to-purple-500/10 text-dash-accent" : "bg-dash-surface-secondary text-dash-text"}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-dash-text text-sm">{name}</div>
                            <div className="text-dash-text-muted text-xs mt-0.5">{phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-dash-text text-sm">{lead.budget ?? <span className="text-dash-text-muted">—</span>}</td>
                      <td className="px-4 py-3 text-dash-text-secondary text-sm">{lead.location ?? <span className="text-dash-text-muted">—</span>}</td>
                      <td className="px-4 py-3 text-dash-text-secondary text-sm">{lead.selected_property ?? <span className="text-dash-text-muted">—</span>}</td>
                      <td className="px-4 py-3 text-dash-text-secondary text-sm capitalize">{lead.intent ?? <span className="text-dash-text-muted">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-full px-2.5 py-1 font-semibold text-[11px] ${colors.bg} ${colors.text} hover:ring-1 hover:ring-current/20`}
                          >
                            {STATUS_LABELS[lead.status]}
                          </button>
                          <div className="dash-animate-scale absolute right-0 z-20 mt-1 hidden group-hover:block">
                            {/* Inline status change on hover - accessible via click */}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lead.lead_score != null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full bg-dash-surface-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${lead.lead_score >= 7 ? "bg-dash-accent" : lead.lead_score >= 4 ? "bg-dash-warning" : "bg-dash-text-muted"}`}
                                style={{ width: `${lead.lead_score * 10}%` }}
                              />
                            </div>
                            <span className="text-dash-text text-xs font-semibold">{lead.lead_score}</span>
                          </div>
                        ) : <span className="text-dash-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-dash-text-muted text-xs">{timeAgo(lead.updated_at)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="rounded-lg p-1.5 text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer (slide-in from right) */}
      {drawerLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerLead(null)}
          />
          <div
            className="dash-animate-slide relative z-10 flex h-full w-full max-w-md flex-col border-dash-border border-l bg-dash-surface shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-dash-border border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerLead(null)}
                  className="rounded-lg p-1 text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${drawerLead.customer_name ? "bg-gradient-to-br from-accent/20 to-purple-500/10 text-dash-accent" : "bg-dash-surface-secondary text-dash-text"}`}>
                  {getInitials(drawerLead)}
                </div>
                <div>
                  <h3 className="font-Helvetica-Neue font-bold text-dash-text text-base">
                    {getDisplayName(drawerLead)}
                  </h3>
                  <p className="text-dash-text-muted text-xs">
                    {extractPhone(drawerLead.chat_id)} · WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerLead(null)}
                className="rounded-lg p-1 text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Qualification Data */}
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs uppercase tracking-wider mb-3">Qualification</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Budget", value: drawerLead.budget },
                    { label: "Location", value: drawerLead.location },
                    { label: "Property", value: drawerLead.selected_property },
                    { label: "Intent", value: drawerLead.intent },
                  ].map((item) => {
                    const known = !!item.value && item.value !== "უცნობია";
                    return (
                      <div
                        key={item.label}
                        className={`rounded-xl p-3 ${known ? "bg-dash-success-muted" : "bg-dash-surface-secondary"}`}
                      >
                        <div className="font-medium text-[10px] text-dash-text-muted uppercase">{item.label}</div>
                        <div className={`font-semibold text-sm mt-0.5 ${known ? "text-dash-text" : "text-dash-text-muted"}`}>
                          {known ? item.value : "Pending"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lead Score */}
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs uppercase tracking-wider mb-3">Lead Score</h4>
                <div className="rounded-xl bg-dash-surface-secondary p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-dash-text-secondary text-sm">Quality Score</span>
                    <span className="font-bold text-dash-accent text-xl">{drawerLead.lead_score ?? "—"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-dash-accent-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-dash-accent transition-all"
                      style={{ width: `${(drawerLead.lead_score ?? 0) * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs uppercase tracking-wider mb-3">Pipeline Status</h4>
                <div className="flex items-center gap-2">
                  {STATUSES.map((s) => {
                    const c = statusColors[s];
                    const isActive = drawerLead.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleInlineStatus(drawerLead.id, s)}
                        disabled={inlineStatusUpdating === drawerLead.id}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-xs transition-all ${isActive ? `${c.bg} ${c.text} ring-1 ring-current/20` : "bg-dash-surface-secondary text-dash-text-muted hover:bg-dash-surface-hover"}`}
                      >
                        {inlineStatusUpdating === drawerLead.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                        )}
                        {STATUS_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs uppercase tracking-wider mb-3">Activity Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-accent-muted">
                      <MessageSquare className="h-3.5 w-3.5 text-dash-accent" />
                    </div>
                    <div>
                      <p className="text-dash-text text-sm">Lead created</p>
                      <p className="text-dash-text-muted text-xs">{formatDate(drawerLead.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-success-muted">
                      <Check className="h-3.5 w-3.5 text-dash-success" />
                    </div>
                    <div>
                      <p className="text-dash-text text-sm">Last activity</p>
                      <p className="text-dash-text-muted text-xs">{timeAgo(drawerLead.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-dash-border border-t px-6 py-4 space-y-2">
              <a
                href={`tel:${extractPhone(drawerLead.chat_id)}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 font-semibold text-white text-sm hover:bg-dash-accent-hover"
              >
                <Phone className="h-4 w-4" />
                Call {getDisplayName(drawerLead)}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${drawerLead.chat_id.split("@")[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-sm hover:bg-dash-surface-hover"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-sm hover:bg-dash-surface-hover"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
