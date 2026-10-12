import { ArrowRight, Check, FileText, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";

const stages = ["Draft", "Awaiting approval", "Approved", "Sent"];

export default async function PresentationsPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; property?: string }>;
}) {
  const selection = await searchParams;
  const hasSelection = Boolean(selection.lead && selection.property);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-dash-border border-b pb-6">
        <p className="font-medium text-dash-accent text-xs uppercase tracking-wider">Sales</p>
        <h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">Personalized presentations</h2>
        <p className="mt-2 max-w-2xl text-dash-text-secondary text-sm">Turn a buyer shortlist into a focused investment case, then route it through human approval before sending.</p>
      </div>

      <section className="rounded-xl border border-dash-border bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? "bg-dash-accent text-white" : "border border-dash-border text-dash-text-muted"}`}>{index === 0 ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
              <span className={`text-xs font-medium ${index === 0 ? "text-dash-text" : "text-dash-text-muted"}`}>{stage}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-xl border border-dash-border bg-white lg:grid-cols-[1.15fr_.85fr]">
        <div className="flex min-h-96 flex-col items-center justify-center px-8 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-accent-muted"><FileText className="h-5 w-5 text-dash-accent" /></div>
          <h3 className="mt-5 font-semibold text-dash-text">{hasSelection ? "Shortlist ready for presentation" : "No presentations yet"}</h3>
          <p className="mt-2 max-w-md text-dash-text-muted text-sm leading-6">{hasSelection ? "Your buyer and selected unit are ready. Presentation creation and approval need to be enabled before this can be sent." : "Choose a buyer and shortlist a live unit to prepare a focused, human-approved presentation."}</p>
          <Link href="/dashboard/leads" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline">{hasSelection ? "Change selection" : "Choose a buyer"}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="border-dash-border border-t bg-slate-50 p-6 lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between gap-3"><p className="text-dash-text-muted text-xs uppercase tracking-wider">Presentation outline</p><span className="rounded-full bg-slate-200 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600">Setup required</span></div>
          <div className="mt-5 space-y-3">
            {["Buyer-specific summary", "Selected units and images", "Pricing and available payment plan", "Verified investment logic", "Project context and sales contact"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-dash-border bg-white px-4 py-3 text-dash-text-secondary text-sm"><span className="h-1.5 w-1.5 rounded-full bg-dash-accent" />{item}</div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-lg bg-slate-950 p-4 text-white"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" /><p className="text-slate-300 text-xs leading-5">Human approval remains a required step before a presentation is sent.</p></div>
        </div>
      </section>
    </div>
  );
}
