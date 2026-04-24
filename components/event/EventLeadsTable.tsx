"use client";

import {
  Check,
  Download,
  Flame,
  Search,
  Target,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Lead {
  id: number;
  timestamp: string;
  company: string;
  name: string;
  phone: string;
  country: string;
  readiness: "HOT" | "EXPLORING" | "QUALIFIED";
  offer: string;
  summary: string;
}

const READINESS = ["HOT", "EXPLORING", "QUALIFIED"] as const;
type Readiness = (typeof READINESS)[number];

const readinessConfig: Record<Readiness, { bg: string; text: string; label: string }> = {
  HOT:       { bg: "bg-dash-warning-muted",  text: "text-dash-warning", label: "Hot" },
  EXPLORING: { bg: "bg-dash-accent-muted",   text: "text-dash-accent",  label: "Exploring" },
  QUALIFIED: { bg: "bg-dash-purple-muted",   text: "text-dash-purple",  label: "Qualified" },
};

function nameInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(raw: string): string {
  const utc = raw.endsWith("Z") || raw.includes("+") ? raw : `${raw}Z`;
  const diff = Date.now() - new Date(utc).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface EventLeadsTableProps {
  companyId?: number;
  title?: string;
}

export default function EventLeadsTable({ companyId, title = "Leads" }: EventLeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [readinessFilter, setReadinessFilter] = useState<"all" | Readiness>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
        if (companyId) params.set("companyId", String(companyId));
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (readinessFilter !== "all") params.set("readiness", readinessFilter);
        const res = await fetch(`/api/event/leads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load leads");
        const json = await res.json();
        setLeads(json.data ?? []);
        if (json.company_name) setCompanyName(json.company_name);
      } catch {
        setError("Could not load leads. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [companyId, debouncedSearch, readinessFilter]);

  const statCounts = {
    total: leads.length,
    hot: leads.filter((l) => l.readiness === "HOT").length,
    exploring: leads.filter((l) => l.readiness === "EXPLORING").length,
    qualified: leads.filter((l) => l.readiness === "QUALIFIED").length,
  };

  const pageTitle = companyName ? `${companyName} — Leads` : title;

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="dash-animate-in flex items-center justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            {pageTitle}
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            Qualified prospects collected at the event.
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
      <div className="dash-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Flame className="h-5 w-5 text-dash-warning" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.hot}</div>
            <div className="text-dash-text-muted text-xs">Hot</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
            <Target className="h-5 w-5 text-dash-accent" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.exploring}</div>
            <div className="text-dash-text-muted text-xs">Exploring</div>
          </div>
        </div>
        <div className="dash-card flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
            <Check className="h-5 w-5 text-dash-purple" />
          </div>
          <div>
            <div className="font-bold text-2xl text-dash-text">{statCounts.qualified}</div>
            <div className="text-dash-text-muted text-xs">Qualified</div>
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
            placeholder="Search by name, phone, country…"
            className="w-full rounded-xl border border-dash-border bg-dash-surface py-2.5 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setReadinessFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${readinessFilter === "all" ? "bg-dash-accent-muted text-dash-accent" : "text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text-secondary"}`}
          >
            All
          </button>
          {READINESS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReadinessFilter(r)}
              className={`rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${readinessFilter === r ? `${readinessConfig[r].bg} ${readinessConfig[r].text}` : "text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text-secondary"}`}
            >
              {readinessConfig[r].label}
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
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">{error}</div>
        ) : loading ? (
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">Loading leads…</div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-12 text-center text-dash-text-muted text-sm">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-dash-border border-b">
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Country</th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Readiness</th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Offer</th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Summary</th>
                  <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const initials = nameInitials(lead.name);
                  const cfg = readinessConfig[lead.readiness];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="cursor-pointer border-dash-border border-b transition-colors last:border-0 hover:bg-dash-surface-hover"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-dash-text text-sm leading-tight">{lead.name}</div>
                            <div className="text-dash-text-muted text-xs">+{lead.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-dash-text-secondary text-sm">{lead.country || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 font-semibold text-[11px] ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-dash-text-secondary text-sm">{lead.offer || "—"}</td>
                      <td className="max-w-xs px-5 py-4 text-dash-text-secondary text-sm">
                        <span className="line-clamp-2">{lead.summary || "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-dash-text-muted text-xs">{timeAgo(lead.timestamp)}</td>
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-sm">
                  {nameInitials(selectedLead.name)}
                </div>
                <div>
                  <h3 className="font-Helvetica-Neue font-bold text-dash-text text-lg leading-tight">
                    {selectedLead.name}
                  </h3>
                  <p className="text-dash-text-muted text-xs">+{selectedLead.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-dash-text-muted hover:text-dash-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">Country</div>
                <div className="mt-0.5 font-bold text-dash-text text-sm">{selectedLead.country || "—"}</div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">Readiness</div>
                <div className="mt-1">
                  <span className={`rounded-full px-2.5 py-1 font-semibold text-[11px] ${readinessConfig[selectedLead.readiness].bg} ${readinessConfig[selectedLead.readiness].text}`}>
                    {readinessConfig[selectedLead.readiness].label}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">Company</div>
                <div className="mt-0.5 font-bold text-dash-text text-sm">{selectedLead.company || "—"}</div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">Time</div>
                <div className="mt-0.5 font-bold text-dash-text text-sm">{timeAgo(selectedLead.timestamp)}</div>
              </div>
            </div>

            {selectedLead.offer && (
              <div className="mt-3 rounded-xl bg-dash-bg p-3">
                <div className="mb-1.5 font-medium text-[10px] text-dash-text-muted uppercase">Offer</div>
                <p className="text-dash-text-secondary text-sm leading-relaxed">{selectedLead.offer}</p>
              </div>
            )}

            {selectedLead.summary && (
              <div className="mt-3 rounded-xl bg-dash-bg p-3">
                <div className="mb-1.5 font-medium text-[10px] text-dash-text-muted uppercase">Summary</div>
                <p className="text-dash-text-secondary text-sm leading-relaxed">{selectedLead.summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
