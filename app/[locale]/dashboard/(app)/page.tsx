"use client";

import { ArrowRight, CheckCircle2, CircleAlert, Clock3, FileText, TicketCheck, Users } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

interface DashboardStats { active: number; qualified: number; total_leads_today: number }
interface LeadRow { id?: number; chat_id: string; customer_name?: string; budget?: string; intent?: string; status?: string; updated_at?: string }
interface CompanyInfo { name?: string }

const copy = {
  en: {
    eyebrow: "Operational overview", title: "Move every serious buyer forward.",
    subtitle: "A focused view of active demand, qualification progress, and the next action your team should take.",
    viewLeads: "Review leads", active: "Active leads", qualified: "Qualified buyers",
    presentations: "Presentations sent", ready: "Reservation ready", paid: "Paid reservations",
    notTracked: "Setup required", attention: "Needs attention",
    attentionBody: "Buyers currently marked for human review.", followups: "Follow-ups due",
    followupsBody: "No scheduled follow-ups are available yet.",
    recent: "Recent buyer activity", recentBody: "The latest real opportunities received by TwinO.",
    empty: "No buyer activity yet", emptyBody: "Connect a lead source to begin receiving and qualifying inquiries.",
    connect: "Open integrations", action: "Open buyer",
  },
  ka: {
    eyebrow: "ოპერაციული მიმოხილვა", title: "გადაადგილეთ ყველა სერიოზული მყიდველი წინ.",
    subtitle: "აქტიური მოთხოვნის, კვალიფიკაციის პროგრესისა და გუნდის შემდეგი მოქმედების მკაფიო ხედი.",
    viewLeads: "ლიდების ნახვა", active: "აქტიური ლიდები", qualified: "კვალიფიცირებული მყიდველები",
    presentations: "გაგზავნილი პრეზენტაციები", ready: "რეზერვაციისთვის მზად", paid: "გადახდილი რეზერვაციები",
    notTracked: "საჭიროა მოწყობა", attention: "საჭიროებს ყურადღებას",
    attentionBody: "მყიდველები, რომლებიც ამჟამად ადამიანის ჩართვას საჭიროებენ.", followups: "შემდგომი კონტაქტი",
    followupsBody: "დაგეგმილი შემდგომი კონტაქტები ჯერ არ არის.",
    recent: "მყიდველების ბოლო აქტივობა", recentBody: "TwinO-ს მიერ მიღებული უახლესი რეალური შესაძლებლობები.",
    empty: "აქტივობა ჯერ არ არის", emptyBody: "მიუერთეთ ლიდების წყარო, რათა დაიწყოთ მოთხოვნების მიღება და კვალიფიკაცია.",
    connect: "ინტეგრაციების გახსნა", action: "მყიდველის გახსნა",
  },
};

export default function DashboardOverview() {
  const locale = useLocale() === "ka" ? "ka" : "en";
  const c = copy[locale];
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/dashboard/company").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/dashboard/leads?limit=8").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([statsData, companyData, leadsData]) => {
        setStats(statsData ?? null);
        setCompany(companyData?.data ?? null);
        setLeads(Array.isArray(leadsData?.data) ? leadsData.data.slice(0, 8) : []);
        setError(!leadsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const attentionLeads = leads.filter((lead) => lead.status === "hot");

  const channel = (chatId: string) => {
    if (chatId.endsWith("@s.whatsapp.net") || chatId.includes("whatsapp")) return "WhatsApp";
    if (chatId.includes("messenger") || chatId.endsWith("@messaging")) return "Messenger";
    if (chatId.includes("instagram")) return "Instagram";
    return "Inbox";
  };

  const operational = [
    { label: c.active, value: stats?.active ?? 0, icon: Users },
    { label: c.qualified, value: stats?.qualified ?? 0, icon: CheckCircle2 },
  ];
  const future = [
    { label: c.presentations, icon: FileText },
    { label: c.ready, icon: Clock3 },
    { label: c.paid, icon: TicketCheck },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 border-dash-border border-b pb-7 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="mb-2 font-semibold text-[11px] uppercase tracking-[0.16em] text-dash-accent">{c.eyebrow}</p>
          <h2 className="font-Helvetica-Neue text-3xl font-semibold tracking-[-0.03em] text-dash-text md:text-4xl">{c.title}</h2>
          <p className="mt-3 max-w-xl text-dash-text-secondary text-sm leading-6">{c.subtitle}</p>
          {company?.name && <p className="mt-3 text-dash-text-muted text-xs">{company.name}</p>}
        </div>
        <Link href="/dashboard/leads" className="inline-flex items-center justify-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline hover:bg-dash-accent-hover">{c.viewLeads}<ArrowRight className="h-4 w-4" /></Link>
      </section>

      <section className="grid gap-px overflow-hidden rounded-xl border border-dash-border bg-dash-border sm:grid-cols-2 lg:grid-cols-5">
        {operational.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-dash-text-muted text-xs">{label}</p><Icon className="h-4 w-4 text-dash-accent" /></div>
            <p className="mt-4 font-Helvetica-Neue text-3xl font-semibold text-dash-text">{loading ? "—" : value}</p>
          </div>
        ))}
        {future.map(({ label, icon: Icon }) => (
          <div key={label} className="bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-dash-text-muted text-xs">{label}</p><Icon className="h-4 w-4 text-dash-text-muted" /></div>
            <p className="mt-4 text-dash-text text-xl font-semibold">—</p><p className="mt-1 text-dash-text-muted text-[11px]">{c.notTracked}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-xl border border-dash-border bg-white">
          <div className="flex items-start justify-between border-dash-border border-b px-5 py-4">
            <div><h3 className="font-semibold text-dash-text text-sm">{c.recent}</h3><p className="mt-1 text-dash-text-muted text-xs">{c.recentBody}</p></div>
            <Link href="/dashboard/leads" className="text-dash-accent text-xs font-semibold no-underline hover:underline">{c.viewLeads}</Link>
          </div>
          {error ? (
            <div className="px-5 py-12 text-center text-dash-danger text-sm">Unable to load current activity.</div>
          ) : loading ? (
            <div className="space-y-3 p-5">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-dash-surface-secondary" />)}</div>
          ) : leads.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-semibold text-dash-text text-sm">{c.empty}</p>
              <p className="mx-auto mt-2 max-w-md text-dash-text-muted text-xs leading-5">{c.emptyBody}</p>
              <Link href="/dashboard/integration" className="mt-4 inline-flex text-dash-accent text-xs font-semibold no-underline hover:underline">{c.connect}</Link>
            </div>
          ) : (
            <div className="divide-y divide-dash-border">
              {leads.map((lead) => (
                <div key={lead.id ?? lead.chat_id} className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[1.2fr_.8fr_.7fr_auto]">
                    <div><p className="font-medium text-dash-text text-sm">{lead.customer_name || `+${lead.chat_id.split("@")[0]}`}</p><p className="mt-0.5 text-dash-text-muted text-xs">{channel(lead.chat_id)} · {lead.status === "hot" ? "Needs attention" : lead.status || "Active"}</p></div>
                  <p className="truncate text-dash-text-secondary text-sm">{lead.intent || "—"}</p>
                  <p className="text-dash-text-secondary text-sm">{lead.budget || "—"}</p>
                  {lead.id ? <Link href={`/dashboard/leads/${lead.id}`} className="inline-flex items-center gap-1 text-dash-accent text-xs font-semibold no-underline">{c.action}<ArrowRight className="h-3 w-3" /></Link> : null}
                </div>
              ))}
            </div>
          )}
        </section>
        <aside className="space-y-4">
          <section className="rounded-xl border border-dash-border bg-white p-5">
            <div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50"><CircleAlert className="h-4 w-4 text-amber-700" /></div><span className="font-Helvetica-Neue text-2xl font-semibold text-dash-text">{loading ? "—" : attentionLeads.length}</span></div>
            <h3 className="mt-4 font-semibold text-dash-text text-sm">{c.attention}</h3>
            <p className="mt-2 text-dash-text-secondary text-xs leading-5">{c.attentionBody}</p>
            {attentionLeads.length > 0 ? <div className="mt-4 divide-y divide-dash-border border-dash-border border-t">{attentionLeads.slice(0, 3).map((lead) => <Link key={lead.id ?? lead.chat_id} href={`/dashboard/conversations?chat=${encodeURIComponent(lead.chat_id)}`} className="flex items-center justify-between gap-3 py-3 text-xs no-underline"><span className="truncate font-medium text-dash-text">{lead.customer_name || `+${lead.chat_id.split("@")[0]}`}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-dash-accent" /></Link>)}</div> : <div className="mt-4 rounded-lg bg-dash-surface-secondary p-3 text-dash-text-muted text-xs">No buyers need review right now.</div>}
          </section>
          <section className="rounded-xl border border-dash-border bg-white p-5">
            <div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent-muted"><Clock3 className="h-4 w-4 text-dash-accent" /></div><span className="text-dash-text-muted text-xl font-semibold">—</span></div>
            <h3 className="mt-4 font-semibold text-dash-text text-sm">{c.followups}</h3>
            <p className="mt-2 text-dash-text-secondary text-xs leading-5">{c.followupsBody}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
