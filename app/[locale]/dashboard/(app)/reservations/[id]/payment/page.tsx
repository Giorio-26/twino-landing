import { ArrowLeft, Circle, CreditCard, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";

const states = ["Not started", "Pending", "Funded", "Confirmed"];

export default async function PaymentStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border-dash-border border-b pb-6">
        <Link href="/dashboard/reservations" className="mb-4 inline-flex items-center gap-1.5 text-dash-text-muted text-xs no-underline hover:text-dash-text"><ArrowLeft className="h-3.5 w-3.5" />Back to reservations</Link>
        <p className="font-medium text-dash-accent text-xs uppercase tracking-wider">Reservation {id}</p>
        <h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">Payment status</h2>
        <p className="mt-2 text-dash-text-secondary text-sm">A provider-neutral view of reservation funding and confirmation.</p>
      </div>

      <section className="rounded-xl border border-dash-border bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100"><CreditCard className="h-5 w-5 text-slate-500" /></div>
          <div><h3 className="font-semibold text-dash-text">Payment provider not configured</h3><p className="mt-2 text-dash-text-muted text-sm leading-6">No wallet, transaction or payment status exists for this reservation. Connect a provider before accepting a reservation payment.</p></div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          {states.map((state, index) => <div key={state} className="rounded-lg border border-dash-border px-3 py-4"><Circle className={`h-3 w-3 ${index === 0 ? "fill-slate-400 text-slate-400" : "text-slate-300"}`} /><p className="mt-3 text-dash-text-muted text-xs font-medium">{state}</p></div>)}
        </div>
      </section>

      <section className="rounded-xl bg-slate-950 p-6 text-white">
        <ShieldCheck className="h-5 w-5 text-blue-400" />
        <h3 className="mt-4 font-semibold">AI drives conversion. Solana secures the commitment.</h3>
        <p className="mt-2 text-slate-300 text-sm leading-6">Solana is limited to the final reservation and payment layer. No blockchain SDK or transaction behavior is installed in this frontend.</p>
      </section>
    </div>
  );
}
