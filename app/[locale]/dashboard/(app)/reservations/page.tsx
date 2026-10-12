import { ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign } from "lucide-react";
import { Link } from "@/i18n/navigation";

const stages = ["Draft", "Awaiting approval", "Ready", "Payment pending", "Confirmed"];

export default function ReservationsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-dash-border border-b pb-6">
        <p className="font-medium text-dash-accent text-xs uppercase tracking-wider">Sales</p>
        <h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">Reservations</h2>
        <p className="mt-2 max-w-2xl text-dash-text-secondary text-sm">Move approved buyers and selected units toward a time-bound, verified commitment.</p>
      </div>

      <section className="rounded-xl border border-dash-border bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-5">
          {stages.map((stage, index) => <div key={stage} className="flex items-center gap-2"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${index === 0 ? "bg-dash-accent text-white" : "border border-dash-border text-dash-text-muted"}`}>{index + 1}</span><span className="text-dash-text-muted text-xs">{stage}</span></div>)}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-dash-border bg-white px-6 py-16 text-center">
        <CalendarClock className="mx-auto h-9 w-9 text-dash-text-muted" />
        <h3 className="mt-5 font-semibold text-dash-text">No reservations yet</h3>
        <p className="mx-auto mt-2 max-w-lg text-dash-text-muted text-sm leading-6">Approved buyers and units will appear here when reservation rules and payment handling are enabled.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/dashboard/presentations" className="inline-flex items-center gap-2 rounded-lg border border-dash-border bg-white px-4 py-2.5 font-semibold text-dash-text text-sm no-underline hover:bg-slate-50">Review presentations<ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/settings" className="inline-flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline">Configure reservations</Link></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: CheckCircle2, title: "Human approval", text: "Keep a person in control before a unit is held." }, { icon: CalendarClock, title: "Time-bound hold", text: "Define reservation amount and expiry when setup is enabled." }, { icon: CircleDollarSign, title: "Provider-neutral payment", text: "Show verified payment status after a provider is connected." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl border border-dash-border bg-white p-5"><Icon className="h-4 w-4 text-dash-accent" /><h3 className="mt-4 font-semibold text-dash-text text-sm">{title}</h3><p className="mt-2 text-dash-text-muted text-xs leading-5">{text}</p><span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Setup required</span></div>)}
      </div>
    </div>
  );
}
