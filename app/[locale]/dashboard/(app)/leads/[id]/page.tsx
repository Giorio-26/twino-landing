"use client";

import { ArrowLeft, ArrowRight, Bot, MessageSquare, Phone, Target, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

interface Lead {
  id: number;
  chat_id: string;
  customer_name: string | null;
  budget: string | null;
  location: string | null;
  selected_property: string | null;
  intent: string | null;
  lead_score: number | null;
  status: "new" | "hot" | "qualified" | "call_in" | "deal";
  updated_at: string;
}

const statusLabels: Record<Lead["status"], string> = {
  new: "New inquiry", hot: "Needs attention", qualified: "Qualified",
  call_in: "Qualifying", deal: "Converted",
};

function value(fieldValue: string | number | null | undefined) {
  return fieldValue == null || fieldValue === "" || fieldValue === "უცნობია" ? "Not available" : String(fieldValue);
}

export default function BuyerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/leads")
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((payload) => {
        const rows: Lead[] = Array.isArray(payload?.data) ? payload.data : [];
        const selected = rows.find((row) => String(row.id) === id) ?? null;
        setLead(selected);
        setNotFound(!selected);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-6xl space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />)}</div>;
  if (notFound || !lead) return (
    <div className="mx-auto max-w-3xl rounded-xl border border-dash-border bg-white px-6 py-16 text-center">
      <UserRound className="mx-auto h-8 w-8 text-dash-text-muted" />
      <h2 className="mt-4 font-semibold text-dash-text">Buyer not available</h2>
      <p className="mt-2 text-dash-text-muted text-sm">This lead could not be found in the current workspace.</p>
      <Link href="/dashboard/leads" className="mt-5 inline-flex text-dash-accent text-sm font-semibold no-underline">Return to leads</Link>
    </div>
  );

  const displayName = lead.customer_name && lead.customer_name !== "უცნობია" ? lead.customer_name : `+${lead.chat_id.split("@")[0]}`;
  const fields = [
    ["Source", "WhatsApp"], ["Buyer type", null], ["Budget", lead.budget], ["Timeline", null],
    ["Preferred location", lead.location], ["Preferred unit", lead.selected_property],
    ["Investment goal", lead.intent], ["Language", null],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-dash-border border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <Link href="/dashboard/leads" className="mb-4 inline-flex items-center gap-1.5 text-dash-text-muted text-xs no-underline hover:text-dash-text"><ArrowLeft className="h-3.5 w-3.5" />Back to leads</Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-accent-muted font-semibold text-dash-accent">{displayName.slice(0, 2).toUpperCase()}</div>
            <div><h2 className="font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">{displayName}</h2><p className="mt-1 flex items-center gap-1.5 text-dash-text-muted text-xs"><Phone className="h-3 w-3" />+{lead.chat_id.split("@")[0]}</p></div>
          </div>
        </div>
        <Link href={`/dashboard/leads/${lead.id}/matches`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline hover:bg-dash-accent-hover">Find matches<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-dash-border bg-white">
            <div className="border-dash-border border-b px-5 py-4"><h3 className="font-semibold text-dash-text text-sm">Buyer summary</h3><p className="mt-1 text-dash-text-muted text-xs">Known details captured from the current qualification flow.</p></div>
            <dl className="grid sm:grid-cols-2">
              {fields.map(([label, fieldValue]) => <div key={label} className="border-dash-border border-b px-5 py-4 last:border-b-0 sm:odd:border-r"><dt className="text-dash-text-muted text-xs">{label}</dt><dd className={`mt-1.5 text-sm ${fieldValue ? "font-medium text-dash-text" : "text-dash-text-muted"}`}>{value(fieldValue)}</dd></div>)}
            </dl>
          </section>
          <section className="rounded-xl border border-dash-border bg-white p-5">
            <div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent-muted"><Bot className="h-4 w-4 text-dash-accent" /></div><div><h3 className="font-semibold text-dash-text text-sm">Conversation context</h3><p className="mt-2 text-dash-text-secondary text-sm leading-6">A structured conversation summary is not available from the current backend. Open the live conversation to review verified context.</p><Link href="/dashboard/conversations" className="mt-4 inline-flex items-center gap-1.5 text-dash-accent text-xs font-semibold no-underline"><MessageSquare className="h-3.5 w-3.5" />Open conversation</Link></div></div>
          </section>
        </div>
        <aside className="space-y-4">
          <section className="rounded-xl border border-dash-border bg-white p-5">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-dash-text text-sm">Qualification</h3><span className="rounded-full bg-dash-accent-muted px-2.5 py-1 font-semibold text-dash-accent text-[11px]">{statusLabels[lead.status]}</span></div>
            <div className="mt-5 space-y-4">
              <div><p className="text-dash-text-muted text-xs">Intent</p><p className="mt-1 text-dash-text text-sm">{value(lead.intent)}</p></div>
              <div><p className="text-dash-text-muted text-xs">Intent score</p><p className="mt-1 text-dash-text text-sm">{lead.lead_score == null ? "Not available" : `${lead.lead_score}/10`}</p></div>
              <div><p className="text-dash-text-muted text-xs">Needs and objections</p><p className="mt-1 text-dash-text-muted text-sm">Not captured as structured data.</p></div>
              <div><p className="text-dash-text-muted text-xs">Human handoff state</p><p className="mt-1 text-dash-text-muted text-sm">Not available from the current lead payload.</p></div>
            </div>
          </section>
          <section className="rounded-xl border border-dash-border bg-slate-950 p-5 text-white">
            <Target className="h-5 w-5 text-blue-400" /><h3 className="mt-4 font-semibold text-sm">Recommended next action</h3><p className="mt-2 text-slate-300 text-xs leading-5">{lead.status === "qualified" || lead.status === "hot" ? "Review available inventory and prepare a relevant shortlist." : "Continue qualification before recommending inventory."}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
