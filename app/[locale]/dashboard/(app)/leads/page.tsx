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
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  location: string;
  intent: string;
  channel: string;
  status: "new" | "contacted" | "qualified" | "converted";
  agent: string;
  lastActivity: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Giorgi Meladze",
    phone: "+995 555 123 456",
    budget: "$80,000",
    location: "Batumi",
    intent: "Investment",
    channel: "WhatsApp",
    status: "qualified",
    agent: "Unassigned",
    lastActivity: "2 min ago",
  },
  {
    id: "2",
    name: "Ana Kapanadze",
    phone: "+995 598 765 432",
    budget: "$120,000",
    location: "Tbilisi",
    intent: "Living",
    channel: "Instagram",
    status: "qualified",
    agent: "Nino",
    lastActivity: "15 min ago",
  },
  {
    id: "3",
    name: "David Richardson",
    phone: "+44 7700 900000",
    budget: "$60,000",
    location: "Batumi",
    intent: "Investment",
    channel: "Facebook",
    status: "contacted",
    agent: "Unassigned",
    lastActivity: "1h ago",
  },
  {
    id: "4",
    name: "Maria Ivanova",
    phone: "+7 916 000 1234",
    budget: "$150,000",
    location: "Tbilisi",
    intent: "Living",
    channel: "WhatsApp",
    status: "new",
    agent: "Unassigned",
    lastActivity: "2h ago",
  },
  {
    id: "5",
    name: "James Wilson",
    phone: "+1 555 0123",
    budget: "$95,000",
    location: "Batumi",
    intent: "Investment",
    channel: "WhatsApp",
    status: "converted",
    agent: "Giorgi",
    lastActivity: "1d ago",
  },
  {
    id: "6",
    name: "Natia Gelashvili",
    phone: "+995 571 000 222",
    budget: "$45,000",
    location: "Kutaisi",
    intent: "Living",
    channel: "WhatsApp",
    status: "new",
    agent: "Unassigned",
    lastActivity: "3h ago",
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-dash-accent-muted", text: "text-dash-accent" },
  contacted: { bg: "bg-dash-warning-muted", text: "text-dash-warning" },
  qualified: { bg: "bg-dash-success-muted", text: "text-dash-success" },
  converted: { bg: "bg-dash-purple-muted", text: "text-dash-purple" },
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = mockLeads.filter((l) => {
    if (
      search &&
      !l.name.toLowerCase().includes(search.toLowerCase()) &&
      !l.phone.includes(search)
    )
      return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const statCounts = {
    total: mockLeads.length,
    qualified: mockLeads.filter((l) => l.status === "qualified").length,
    converted: mockLeads.filter((l) => l.status === "converted").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
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
              {statCounts.converted}
            </div>
            <div className="text-dash-text-muted text-xs">Converted</div>
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
          {["all", "new", "contacted", "qualified", "converted"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 font-medium text-xs capitalize transition-colors ${statusFilter === s ? "bg-dash-accent-muted text-dash-accent" : "text-dash-text-muted hover:bg-dash-surface-hover hover:text-dash-text-secondary"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.2s" }}
      >
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
                  Channel
                </th>
                <th className="px-5 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="cursor-pointer border-dash-border border-b transition-colors hover:bg-dash-surface-hover"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-xs">
                        {lead.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-dash-text text-sm">
                          {lead.name}
                        </div>
                        <div className="text-dash-text-muted text-xs">
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-dash-text text-sm">
                    {lead.budget}
                  </td>
                  <td className="px-5 py-4 text-dash-text-secondary text-sm">
                    {lead.location}
                  </td>
                  <td className="px-5 py-4 text-dash-text-secondary text-sm">
                    {lead.intent}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold text-[11px] capitalize ${statusColors[lead.status].bg} ${statusColors[lead.status].text}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-dash-text-muted text-sm">
                    {lead.channel}
                  </td>
                  <td className="px-5 py-4 text-dash-text-muted text-xs">
                    {lead.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedLead(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dash-animate-scale w-full max-w-lg rounded-2xl border border-dash-border bg-dash-surface p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-Helvetica-Neue font-bold text-dash-text text-lg">
                {selectedLead.name}
              </h3>
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
                  {selectedLead.budget}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Location
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.location}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Intent
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.intent}
                </div>
              </div>
              <div className="rounded-xl bg-dash-bg p-3">
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Channel
                </div>
                <div className="font-bold text-dash-text text-sm">
                  {selectedLead.channel}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-dash-bg p-3">
              <div className="mb-1 font-medium text-[10px] text-dash-text-muted uppercase">
                Phone
              </div>
              <div className="font-bold text-dash-text text-sm">
                {selectedLead.phone}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover"
              >
                <Phone className="h-4 w-4" />
                Call
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-sm hover:bg-dash-surface-hover"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
