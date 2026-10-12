"use client";

import { ArrowLeft, ArrowRight, Bot, Check, Circle, Clock3, MessageSquare, Phone, Target, UserRound } from "lucide-react";
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
  new: "New inquiry", hot: "Needs attention", qualified: "Qualified", call_in: "Qualifying", deal: "Converted",
};

const journey = ["Inquiry", "Qualified", "Matched", "Presentation", "Follow-up", "Approval", "Reservation"];

function value(fieldValue: string | number | null | undefined) {
  return fieldValue == null || fieldValue === "" || fieldValue === "უცნობია" ? "Not provided" : String(fieldValue);
}

function channel(chatId: string) {
  if (chatId.endsWith("@s.whatsapp.net") || chatId.includes("whatsapp")) return "WhatsApp";
  if (chatId.includes("messenger") || chatId.endsWith("@messaging")) return "Messenger";
  if (chatId.includes("instagram")) return "Instagram";
  return "Inbox";
}

function nextAction(lead: Lead) {
  if (lead.status === "deal") return { title: "No immediate action", body: "This opportunity is already marked as converted.", href: null, cta: null };
  if (lead.status === "hot") return { title: "Human review required", body: "Open the conversation and review the latest buyer context before TwinO continues.", href: `/dashboard/conversations?chat=${encodeURIComponent(lead.chat_id)}`, cta: "Review in Inbox" };
  if (lead.status === "qualified" && !lead.selected_property) return { title: "Review matching inventory", body: "Qualification is complete and no property is selected yet.", href: `/dashboard/leads/${lead.id}/matches`, cta: "Find matches" };
  if (lead.status === "qualified") return { title: "Review the selected property", body: "Confirm fit before preparing a buyer presentation.", href: `/dashboard/leads/${lead.id}/matches`, cta: "Review inventory" };
  return { title: "Continue qualification", body: "TwinO is still collecting the buyer context needed for a relevant recommendation.", href: `/dashboard/conversations?chat=${encodeURIComponent(lead.chat_id)}`, cta: "Open Inbox" };
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
      <p className="mt-2 text-dash-text-muted text-sm">This buyer could not be found in the current workspace.</p>
      <Link href="/dashboard/leads" className="mt-5 inline-flex text-dash-accent text-sm font-semibold no-underline">Return to leads</Link>
    </div>
  );

  const displayName = lead.customer_name && lead.customer_name !== "უცნობია" ? lead.customer_name : `+${lead.chat_id.split("@")[0]}`;
  const source = channel(lead.chat_id);
  const action = nextAction(lead);
  const journeyIndex = lead.selected_property ? 2 : (["qualified", "hot", "deal"] as Lead["status"][]).includes(lead.status) ? 1 : 0;
  const fields: Array<[string, string | number | null]> = [
    ["Source", source], ["Budget", lead.budget], ["Preferred location", lead.location],
    ["Selected property", lead.selected_property], ["Investment goal", lead.intent], ["Intent score", lead.lead_score == null ? null : `${lead.lead_score}/10`],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-dash-border border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <Link href="/dashboard/leads" className="mb-4 inline-flex items-center gap-1.5 text-dash-text-muted text-xs no-underline hover:text-dash-text"><ArrowLeft className="h-3.5 w-3.5" />Back to leads</Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-accent-muted font-semibold text-dash-accent">{displayName.replace(/\W/g, "").slice(0, 2).toUpperCase()}</div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">{displayName}</h2><span className="rounded-full bg-dash-accent-muted px-2.5 py-1 font-semibold text-dash-accent text-[11px]">{statusLabels[lead.status]}</span></div><p className="mt-1 flex items-center gap-1.5 text-dash-text-muted text-xs"><Phone className="h-3 w-3" />+{lead.chat_id.split("@")[0]} · {source}</p></div>
          </div>
        </div>
        <Link href={`/dashboard/conversations?chat=${encodeURIComponent(lead.chat_id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline hover:bg-dash-accent-hover"><MessageSquare className="h-4 w-4" />Open in Inbox</Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-dash-border bg-white px-5 py-4">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-dash-text text-sm">Buyer journey</h3><p className="mt-1 text-dash-text-muted text-xs">Progress based on confirmed buyer and inventory state.</p></div><span className="hidden text-dash-text-muted text-xs sm:block">Current: {journey[journeyIndex]}</span></div>
        <div className="mt-5 flex overflow-x-auto pb-1">
          {journey.map((stage, index) => {
            const complete = index < journeyIndex;
            const current = index === journeyIndex;
            return <div key={stage} className="flex min-w-[118px] flex-1 items-center last:min-w-[90px]"><div className="flex flex-col items-center"><span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${complete ? "border-dash-accent bg-dash-accent text-white" : current ? "border-dash-accent bg-dash-accent-muted text-dash-accent" : "border-dash-border bg-white text-dash-text-muted"}`}>{complete ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={`mt-2 whitespace-nowrap text-[10px] font-medium ${current ? "text-dash-accent" : "text-dash-text-muted"}`}>{stage}</span></div>{index < journey.length - 1 && <span className={`mx-2 mb-5 h-px flex-1 ${index < journeyIndex ? "bg-dash-accent" : "bg-dash-border"}`} />}</div>;
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-dash-border bg-white">
            <div className="border-dash-border border-b px-5 py-4"><h3 className="font-semibold text-dash-text text-sm">Buyer intelligence</h3><p className="mt-1 text-dash-text-muted text-xs">Known details captured through the live qualification flow.</p></div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(([label, fieldValue]) => <div key={label} className="border-dash-border border-b px-5 py-4 sm:odd:border-r lg:[&:not(:nth-child(3n))]:border-r"><dt className="text-dash-text-muted text-xs">{label}</dt><dd className={`mt-1.5 text-sm ${fieldValue != null ? "font-medium text-dash-text" : "text-dash-text-muted"}`}>{value(fieldValue)}</dd></div>)}
            </dl>
          </section>

          <section className="grid gap-px overflow-hidden rounded-xl border border-dash-border bg-dash-border md:grid-cols-2">
            <div className="bg-white p-5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent-muted"><Bot className="h-4 w-4 text-dash-accent" /></div><h3 className="mt-4 font-semibold text-dash-text text-sm">Conversation</h3><p className="mt-2 text-dash-text-secondary text-sm leading-6">Review the complete verified thread, channel and takeover state in the Inbox.</p><Link href={`/dashboard/conversations?chat=${encodeURIComponent(lead.chat_id)}`} className="mt-4 inline-flex items-center gap-1.5 text-dash-accent text-xs font-semibold no-underline">Open conversation<ArrowRight className="h-3.5 w-3.5" /></Link></div>
            <div className="bg-white p-5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-surface-secondary"><Clock3 className="h-4 w-4 text-dash-text-secondary" /></div><h3 className="mt-4 font-semibold text-dash-text text-sm">Follow-up</h3><p className="mt-2 text-dash-text-secondary text-sm leading-6">No scheduled follow-up is available for this buyer yet.</p><p className="mt-4 text-dash-text-muted text-[11px]">Updated {new Date(lead.updated_at).toLocaleDateString()}</p></div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-dash-border bg-slate-950 p-5 text-white shadow-sm">
            <Target className="h-5 w-5 text-blue-400" /><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">TwinO Next Action</p><h3 className="mt-2 font-semibold text-base">{action.title}</h3><p className="mt-2 text-slate-300 text-xs leading-5">{action.body}</p>{action.href && action.cta && <Link href={action.href} className="mt-5 inline-flex items-center gap-1.5 text-blue-300 text-xs font-semibold no-underline">{action.cta}<ArrowRight className="h-3.5 w-3.5" /></Link>}
          </section>
          <section className="rounded-xl border border-dash-border bg-white p-5"><h3 className="font-semibold text-dash-text text-sm">Qualification coverage</h3><div className="mt-4 space-y-3">{[["Budget", lead.budget], ["Location", lead.location], ["Intent", lead.intent], ["Property", lead.selected_property]].map(([label, item]) => <div key={label} className="flex items-center justify-between gap-3"><span className="text-dash-text-secondary text-xs">{label}</span><span className={`flex items-center gap-1.5 text-[11px] font-medium ${item && item !== "უცნობია" ? "text-dash-success" : "text-dash-text-muted"}`}>{item && item !== "უცნობია" ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}{item && item !== "უცნობია" ? "Captured" : "Pending"}</span></div>)}</div></section>
        </aside>
      </div>
    </div>
  );
}
