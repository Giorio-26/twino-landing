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
        <h3 className="mt-5 font-semibold text-dash-text">Reservation workflow not configured</h3>
        <p className="mx-auto mt-2 max-w-lg text-dash-text-muted text-sm leading-6">The current backend does not persist reservations, approval states, amounts or expiry. No transactions are being simulated on this screen.</p>
        <Link href="/dashboard/presentations" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-dash-border bg-white px-4 py-2.5 font-semibold text-dash-text text-sm no-underline hover:bg-slate-50">Review presentation flow<ArrowRight className="h-4 w-4" /></Link>
      </section>

      <section className="rounded-xl border border-dash-border bg-white p-5">
        <div className="flex flex-col justify-between gap-2 border-dash-border border-b pb-4 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-dash-text text-sm">Reservation record</h3><p className="mt-1 text-dash-text-muted text-xs">Fields required when reservation persistence is connected.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Unavailable</span></div>
        <dl className="mt-4 grid gap-px overflow-hidden rounded-lg bg-dash-border sm:grid-cols-2 lg:grid-cols-4">
          {["Buyer", "Selected unit", "Unit price", "Reservation amount", "Expiry", "Approval state", "Payment method", "Reservation status"].map((field) => <div key={field} className="bg-slate-50 p-4"><dt className="text-dash-text-muted text-[10px] uppercase tracking-wider">{field}</dt><dd className="mt-2 text-dash-text-muted text-xs">Not available</dd></div>)}
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: CheckCircle2, title: "Human approval", text: "Required before a reservation is ready." }, { icon: CalendarClock, title: "Time-bound hold", text: "Amount and expiry require backend configuration." }, { icon: CircleDollarSign, title: "Provider-neutral payment", text: "Payment status appears only after a provider is connected." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl border border-dash-border bg-white p-5"><Icon className="h-4 w-4 text-dash-accent" /><h3 className="mt-4 font-semibold text-dash-text text-sm">{title}</h3><p className="mt-2 text-dash-text-muted text-xs leading-5">{text}</p></div>)}
      </div>
    </div>
  );
}
