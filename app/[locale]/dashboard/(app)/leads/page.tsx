"use client";

import {
  Check,
  Download,
  MessageSquare,
  Phone,
  Search,
  Target,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Lead {
  id: number;
  company_id: string;
  chat_id: string;
  customer_name: string | null;
  budget: string | null;
  location: string | null;
  intent: string | null;
  lead_score: number | null;
  status: "new" | "hot" | "qualified" | "call_in" | "deal";
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

const statusColors: Record<Status, { bg: string; text: string }> = {
  new: { bg: "bg-dash-accent-muted", text: "text-dash-accent" },
  hot: { bg: "bg-dash-warning-muted", text: "text-dash-warning" },
  qualified: { bg: "bg-dash-success-muted", text: "text-dash-success" },
  call_in: { bg: "bg-dash-purple-muted", text: "text-dash-purple" },
  deal: { bg: "bg-teal-500/10", text: "text-teal-400" },
};

function extractPhone(chatId: string): string {
  const raw = chatId.split("@")[0];
  return `+${raw}`;
}

function phoneInitials(chatId: string): string {
  const digits = chatId.replace(/\D/g, "");
  return digits.slice(-2);
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

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
  }, [debouncedSearch, statusFilter]);

  async function handleStatusUpdate() {
    if (!selectedLead || !pendingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/dashboard/leads/${selectedLead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Lead = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLead(updated);
      setPendingStatus(null);
    } catch {
      // keep modal open, user can retry
    } finally {
      setUpdatingStatus(false);
    }
  }

  const statCounts = {
    total: leads.length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    deal: leads.filter((l) => l.status === "deal").length,
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="dash-animate-in flex items-center justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            Leads
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            Qualified prospects from your Sales Twin conversations.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-dash-border px-4 py-2.5 font-medium text-dash-text-secondary text-sm transition-colors hover:bg-dash-surface-hover hover:text-dash-text"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="dash-stagger grid gap-4 sm:grid-cols-3">
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
            <User className="h-5 w-5 text-dash-accent" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">
              {statCounts.total}
            </div>
            <div className="text-dash-text-muted text-xs">Total Leads</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-success-muted">
            <Target className="h-5 w-5 text-dash-success" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">
              {statCounts.qualified}
            </div>
            <div className="text-dash-text-muted text-xs">Qualified</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
            <Check className="h-5 w-5 text-dash-purple" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">
              {statCounts.deal}
            </div>
            <div className="text-dash-text-muted text-xs">Deals</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="dash-animate-in flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="relative max-w-sm flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-dash-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full rounded-xl border border-dash-border bg-dash-surface py-2.5 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${statusFilter === s ? "bg-dash-accent-muted text-dash-accent" : "text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text-secondary"}`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.2s" }}
      >
        {error ? (
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">
            {error}
          </div>
        ) : loading ? (
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">
            Loading leads…
          </div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">
            No leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-dash-border border-b">
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Intent
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const phone = extractPhone(lead.chat_id);
                  const initials = phoneInitials(lead.chat_id);
                  const colors = statusColors[lead.status] ?? statusColors.new;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setPendingStatus(null);
                      }}
                      className="cursor-pointer border-dash-border border-b transition-colors hover:bg-dash-surface-hover"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-xs">
                            {initials}
                          </div>
                          <div>
                            {lead.customer_name && (
                              <div className="font-medium text-dash-text text-sm">
                                {lead.customer_name}
                              </div>
                            )}
                            <div className={`text-dash-text-secondary text-xs ${lead.customer_name ? "mt-0.5" : "font-medium text-dash-text text-sm"}`}>
                              {phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-dash-text text-sm">
                        {lead.budget ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-dash-text-secondary text-sm">
                        {lead.location ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-dash-text-secondary text-sm capitalize">
                        {lead.intent ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 font-semibold text-[11px] ${colors.bg} ${colors.text}`}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-dash-text-secondary text-sm">
                        {lead.lead_score ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-dash-text-muted text-xs">
                        {timeAgo(lead.updated_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0"
            onClick={() => setSelectedLead(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="dash-animate-scale relative w-full max-w-lg rounded-2xl border border-dash-border bg-dash-surface p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                {selectedLead.customer_name && (
                  <h3 className="font-Helvetica-Neue font-bold text-dash-text text-lg">
                    {selectedLead.customer_name}
                  </h3>
                )}
                <p className={`text-dash-text-secondary text-sm ${!selectedLead.customer_name ? "font-Helvetica-Neue font-bold text-dash-text text-lg" : "mt-0.5"}`}>
                  {extractPhone(selectedLead.chat_id)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-dash-text-muted hover:text-dash-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Budget
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.budget ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Location
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.location ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Intent
                </div>
                <div className="font-bold text-dash-text text-sm capitalize">
                  {selectedLead.intent ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Lead Score
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.lead_score ?? "—"}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 rounded-xl bg-dash-bg p-3">
              <div className="mb-2 font-medium text-[10px] text-dash-text-muted uppercase">
                Status
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold text-[11px] ${(statusColors[selectedLead.status] ?? statusColors.new).bg} ${(statusColors[selectedLead.status] ?? statusColors.new).text}`}
                >
                  {STATUS_LABELS[selectedLead.status]}
                </span>
                {selectedLead.status === "call_in" && (
                  <button
                    type="button"
                    onClick={() => setPendingStatus(pendingStatus === "deal" ? null : "deal")}
                    className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-colors ${pendingStatus === "deal" ? "bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/40" : "bg-teal-500 text-white hover:bg-teal-400"}`}
                  >
                    Mark as Deal
                  </button>
                )}
              </div>
              {pendingStatus === "deal" && selectedLead.status === "call_in" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleStatusUpdate}
                  className="mt-3 w-full rounded-xl bg-dash-accent py-2 font-semibold text-sm text-white transition-opacity hover:bg-dash-accent-hover disabled:opacity-60"
                >
                  {updatingStatus ? "Saving…" : "Confirm Deal"}
                </button>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={`tel:${extractPhone(selectedLead.chat_id)}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={`https://wa.me/${selectedLead.chat_id.split("@")[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-sm hover:bg-dash-surface-hover"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
