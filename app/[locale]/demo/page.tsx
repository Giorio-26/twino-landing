"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BedDouble,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Handshake,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

type DemoStep = {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const steps: DemoStep[] = [
  { label: "Inbox", shortLabel: "Inquiry", icon: MessageCircle },
  { label: "Buyer Profile", shortLabel: "Qualified", icon: Target },
  { label: "Property Matching", shortLabel: "Matched", icon: Building2 },
  { label: "Presentation", shortLabel: "Presented", icon: FileText },
  { label: "Human Handoff", shortLabel: "Handoff", icon: UserCheck },
  { label: "Reservation", shortLabel: "Reserved", icon: FileCheck2 },
  { label: "Solana Escrow", shortLabel: "Confirmed", icon: WalletCards },
];

const buyer = {
  name: "Maya Chen",
  initials: "MC",
  phone: "+44 7700 900 284",
  channel: "WhatsApp",
  message: "Hi — I’m looking for a sea-view apartment in Batumi as a rental investment. My budget is around $180k and I’d like to move this month.",
  budget: "$160,000–$185,000",
  timeline: "Ready this month",
  intent: "Rental income + long-term appreciation",
  location: "New Boulevard, Batumi",
  status: "Qualified — high intent",
};

const properties = [
  {
    name: "Azure Residences",
    unit: "A-1204",
    price: "$174,000",
    size: "72 m²",
    bedrooms: "2 bedroom",
    availability: "Available now",
    plan: "30% now · 70% over 18 months",
    fit: "Strongest fit",
    reason: "Sea view · within budget · rental-ready area",
  },
  {
    name: "Marina Heights",
    unit: "B-904",
    price: "$181,500",
    size: "68 m²",
    bedrooms: "2 bedroom",
    availability: "Available in 30 days",
    plan: "40% now · 60% over 12 months",
    fit: "Good fit",
    reason: "Marina access · upper budget range",
  },
  {
    name: "Botanica House",
    unit: "C-603",
    price: "$158,000",
    size: "79 m²",
    bedrooms: "2 bedroom",
    availability: "Available now",
    plan: "50% now · 50% on completion",
    fit: "Alternative",
    reason: "More space · quieter residential setting",
  },
];

const selectedProperty = properties[0];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [handoffApproved, setHandoffApproved] = useState(false);
  const StepIcon = steps[currentStep].icon;

  const goBack = () => setCurrentStep((current) => Math.max(0, current - 1));
  const goNext = () => setCurrentStep((current) => Math.min(steps.length - 1, current + 1));

  return (
    <main className="dashboard-theme min-h-screen bg-dash-bg-subtle text-dash-text">
      <header className="border-dash-border border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="TwinO home"><Image src="/images/twino.svg" alt="TwinO" width={104} height={28} priority /></Link>
            <span className="hidden h-5 w-px bg-dash-border sm:block" />
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 text-[10px] font-semibold uppercase tracking-[0.12em]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Demo environment
            </div>
          </div>
          <div className="flex items-center gap-3 text-dash-text-muted text-xs">
            <span className="hidden sm:inline">Colosseum Loom journey</span>
            <span className="rounded-full bg-dash-surface-secondary px-3 py-1.5 font-medium text-dash-text-secondary">{currentStep + 1} / {steps.length}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <nav aria-label="Demo progress" className="overflow-x-auto rounded-2xl border border-dash-border bg-white px-4 py-4 shadow-sm sm:px-6">
          <div className="flex min-w-[860px] items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const complete = index < currentStep;
              const active = index === currentStep;
              return (
                <div key={step.label} className="flex flex-1 items-center last:flex-none">
                  <button type="button" onClick={() => setCurrentStep(index)} className="group flex items-center gap-2.5 text-left">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${complete ? "border-dash-accent bg-dash-accent text-white" : active ? "border-dash-accent bg-dash-accent-muted text-dash-accent" : "border-dash-border bg-white text-dash-text-muted group-hover:border-dash-accent/40"}`}>{complete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}</span>
                    <span><span className={`block text-[10px] font-semibold uppercase tracking-wider ${active ? "text-dash-accent" : "text-dash-text-muted"}`}>0{index + 1}</span><span className={`mt-0.5 block whitespace-nowrap text-xs font-medium ${active || complete ? "text-dash-text" : "text-dash-text-muted"}`}>{step.shortLabel}</span></span>
                  </button>
                  {index < steps.length - 1 && <span className={`mx-3 h-px flex-1 ${index < currentStep ? "bg-dash-accent" : "bg-dash-border"}`} />}
                </div>
              );
            })}
          </div>
        </nav>

        <section className="mt-5 overflow-hidden rounded-2xl border border-dash-border bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col border-dash-border border-b bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted text-dash-accent"><StepIcon className="h-4.5 w-4.5" /></span>
              <div><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-[0.15em]">Sales Twin demo · Step {currentStep + 1}</p><h1 className="mt-1 font-Helvetica-Neue text-xl font-semibold tracking-tight text-dash-text">{steps[currentStep].label}</h1></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-dash-text-muted text-xs sm:mt-0"><span className="rounded-full bg-dash-surface-secondary px-2.5 py-1 font-medium">Demo data</span><span>{buyer.name} · {selectedProperty.unit}</span></div>
          </div>

          <div className="min-h-[570px] bg-dash-bg-subtle p-4 sm:p-6 lg:p-8">
            {currentStep === 0 && <InboxStep />}
            {currentStep === 1 && <BuyerProfileStep />}
            {currentStep === 2 && <PropertyMatchingStep />}
            {currentStep === 3 && <PresentationStep />}
            {currentStep === 4 && <HandoffStep approved={handoffApproved} onApprove={() => setHandoffApproved(true)} />}
            {currentStep === 5 && <ReservationStep />}
            {currentStep === 6 && <PaymentStep />}
          </div>

          <footer className="flex items-center justify-between border-dash-border border-t bg-white px-5 py-4 sm:px-7">
            <button type="button" onClick={goBack} disabled={currentStep === 0} className="inline-flex items-center gap-2 rounded-lg border border-dash-border px-4 py-2.5 font-semibold text-dash-text-secondary text-sm transition-colors hover:bg-dash-surface-secondary disabled:cursor-not-allowed disabled:opacity-35"><ArrowLeft className="h-4 w-4" />Back</button>
            <p className="hidden text-dash-text-muted text-xs md:block">Use the progress rail or controls to move through the demo.</p>
            {currentStep < steps.length - 1 ? <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm shadow-sm transition-colors hover:bg-dash-accent-hover">Next: {steps[currentStep + 1].label}<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => setCurrentStep(0)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 font-semibold text-white text-sm">Replay demo<ArrowRight className="h-4 w-4" /></button>}
          </footer>
        </section>
      </div>
    </main>
  );
}

function InboxStep() {
  return (
    <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-dash-border bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-dash-border border-b lg:border-r lg:border-b-0">
        <div className="border-dash-border border-b p-4"><div className="rounded-lg bg-dash-surface-secondary px-3 py-2.5 text-dash-text-muted text-xs">Search conversations</div><div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider"><span className="text-dash-text-muted">1 conversation</span><span className="flex items-center gap-1.5 text-dash-success"><span className="h-1.5 w-1.5 rounded-full bg-dash-success" />Live</span></div></div>
        <div className="border-dash-accent border-l-2 bg-dash-accent-muted/40 p-4"><div className="flex items-start gap-3"><Avatar /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-dash-text text-sm">{buyer.name}</p><span className="text-dash-text-muted text-[10px]">just now</span></div><p className="mt-1 truncate text-dash-text-secondary text-xs">Looking for a sea-view investment…</p><div className="mt-2 flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[9px] font-semibold">WhatsApp</span><span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 text-[9px] font-semibold">New inquiry</span></div></div></div></div>
      </aside>
      <div className="flex min-h-[470px] flex-col">
        <div className="flex items-center justify-between border-dash-border border-b px-5 py-4"><div className="flex items-center gap-3"><Avatar /><div><p className="font-semibold text-dash-text text-sm">{buyer.name}</p><p className="mt-0.5 flex items-center gap-1.5 text-dash-text-muted text-xs"><Phone className="h-3 w-3" />{buyer.phone} · WhatsApp</p></div></div><span className="rounded-full bg-dash-accent-muted px-2.5 py-1 text-dash-accent text-[10px] font-semibold">TwinO active</span></div>
        <div className="flex flex-1 flex-col justify-end gap-4 bg-[#f7f7f4] p-5 sm:p-7">
          <div className="max-w-lg rounded-2xl rounded-tl-sm border border-dash-border bg-white px-4 py-3.5 text-dash-text-secondary text-sm leading-6 shadow-sm"><p>{buyer.message}</p><p className="mt-2 text-dash-text-muted text-[10px]">10:42 · WhatsApp</p></div>
          <div className="ml-auto max-w-lg rounded-2xl rounded-tr-sm bg-dash-accent px-4 py-3.5 text-white text-sm leading-6 shadow-sm"><div className="mb-2 flex items-center gap-1.5 text-blue-100 text-[10px] font-semibold"><Bot className="h-3 w-3" />TwinO Sales Twin</div><p>Absolutely, Maya. I’ll narrow this to sea-view units within your budget and compare availability and payment plans. Is rental income your main investment goal?</p><p className="mt-2 text-blue-100 text-[10px]">10:42 · Delivered</p></div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-dash-text-muted text-[10px] shadow-sm"><Sparkles className="h-3 w-3 text-dash-accent" />Qualification started automatically</div>
        </div>
      </div>
    </div>
  );
}

function BuyerProfileStep() {
  const details = [["Budget", buyer.budget], ["Timeline", buyer.timeline], ["Investment intent", buyer.intent], ["Location preference", buyer.location]];
  const rail = ["Inquiry", "Qualified", "Matched", "Presentation", "Handoff", "Reservation", "Payment"];
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-2xl border border-dash-border bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><Avatar large /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-Helvetica-Neue text-xl font-semibold">{buyer.name}</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 text-[10px] font-semibold">{buyer.status}</span></div><p className="mt-1 text-dash-text-muted text-xs">{buyer.phone} · {buyer.channel} · English</p></div></div><div className="rounded-xl bg-slate-950 px-4 py-3 text-white"><p className="text-white/50 text-[9px] uppercase tracking-wider">Intent score</p><p className="mt-1 font-Helvetica-Neue text-xl font-semibold">9.2<span className="text-white/40 text-xs"> / 10</span></p></div></div></div>
      <div className="overflow-x-auto rounded-2xl border border-dash-border bg-white p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-[0.14em]">Buyer journey</p><div className="mt-5 flex min-w-[760px] items-center">{rail.map((item, index) => <div key={item} className="flex flex-1 items-center last:flex-none"><div className="flex flex-col items-center"><span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${index === 0 ? "border-dash-accent bg-dash-accent text-white" : index === 1 ? "border-dash-accent bg-dash-accent-muted text-dash-accent" : "border-dash-border text-dash-text-muted"}`}>{index === 0 ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={`mt-2 text-[10px] font-medium ${index === 1 ? "text-dash-accent" : "text-dash-text-muted"}`}>{item}</span></div>{index < rail.length - 1 && <span className={`mx-2 mb-5 h-px flex-1 ${index === 0 ? "bg-dash-accent" : "bg-dash-border"}`} />}</div>)}</div></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-dash-border bg-dash-border sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">{label}</p><p className="mt-2 font-medium text-dash-text text-sm">{value}</p></div>)}</div>
        <div className="rounded-2xl bg-slate-950 p-5 text-white"><Target className="h-5 w-5 text-blue-400" /><p className="mt-5 text-blue-300 text-[10px] font-semibold uppercase tracking-[0.14em]">TwinO Next Action</p><h3 className="mt-2 font-semibold">Review matched inventory</h3><p className="mt-2 text-white/60 text-xs leading-5">Qualification is complete. Three available units match Maya’s budget, location and investment goal.</p></div>
      </div>
    </div>
  );
}

function PropertyMatchingStep() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-dash-accent text-[10px] font-semibold uppercase tracking-[0.14em]">3 live matches</p><h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight">Best units for {buyer.name}</h2><p className="mt-2 text-dash-text-secondary text-sm">Ranked against budget, sea-view preference, timeline and rental investment intent.</p></div><div className="flex gap-5 text-xs"><div><p className="text-dash-text-muted">Budget</p><p className="mt-1 font-medium">{buyer.budget}</p></div><div><p className="text-dash-text-muted">Location</p><p className="mt-1 font-medium">New Boulevard</p></div></div></div>
      <div className="grid gap-4 lg:grid-cols-3">{properties.map((property, index) => <article key={property.unit} className={`relative overflow-hidden rounded-2xl border bg-white ${index === 0 ? "border-dash-accent shadow-[0_14px_40px_rgba(0,114,255,0.12)]" : "border-dash-border"}`}>{index === 0 && <div className="absolute top-4 right-4 z-10 rounded-full bg-dash-accent px-2.5 py-1 text-white text-[9px] font-semibold uppercase tracking-wider">Strongest fit</div>}<div className={`h-28 ${index === 0 ? "bg-gradient-to-br from-blue-100 via-sky-50 to-slate-100" : index === 1 ? "bg-gradient-to-br from-slate-200 via-blue-50 to-white" : "bg-gradient-to-br from-emerald-50 via-stone-100 to-white"}`}><div className="flex h-full items-end p-4"><span className="rounded-lg bg-white/85 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">{property.availability}</span></div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{property.name}</h3><p className="mt-1 text-dash-text-muted text-xs">Unit {property.unit} · Sea-view residence</p></div><p className="font-semibold">{property.price}</p></div><div className="mt-4 flex items-center gap-4 border-dash-border border-y py-3 text-dash-text-secondary text-xs"><span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{property.size}</span><span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{property.bedrooms}</span></div><div className="mt-4"><p className="text-dash-text-muted text-[10px] uppercase tracking-wider">Payment plan</p><p className="mt-1.5 text-dash-text text-xs font-medium">{property.plan}</p><p className="mt-3 flex items-start gap-1.5 text-dash-text-secondary text-xs leading-5"><Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-dash-accent" />{property.reason}</p></div><div className={`mt-5 flex items-center justify-center rounded-lg py-2.5 text-xs font-semibold ${index === 0 ? "bg-dash-accent text-white" : "bg-dash-surface-secondary text-dash-text-secondary"}`}>{index === 0 ? <><Check className="mr-1.5 h-3.5 w-3.5" />Selected for presentation</> : "Compare unit"}</div></div></article>)}</div>
    </div>
  );
}

function PresentationStep() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="overflow-hidden rounded-2xl border border-dash-border bg-white shadow-sm"><div className="flex items-center justify-between bg-slate-950 px-6 py-5 text-white"><div><p className="text-blue-300 text-[10px] font-semibold uppercase tracking-[0.14em]">Personal investment brief</p><h2 className="mt-2 font-Helvetica-Neue text-xl font-semibold">Prepared for {buyer.name}</h2></div><Image src="/images/twino.svg" alt="TwinO" width={86} height={24} className="brightness-0 invert" /></div><div className="p-6"><div className="grid gap-5 sm:grid-cols-[1fr_220px]"><div><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">Buyer-specific summary</p><h3 className="mt-3 font-Helvetica-Neue text-2xl font-semibold tracking-tight">A rental-ready sea-view investment within budget.</h3><p className="mt-3 text-dash-text-secondary text-sm leading-6">Azure Residences A-1204 aligns with Maya’s target location, immediate timeline and rental-income objective while preserving payment flexibility.</p></div><div className="rounded-xl bg-gradient-to-br from-blue-100 via-sky-50 to-slate-100 p-4"><span className="rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold">Selected unit</span><div className="mt-16 rounded-lg bg-white p-3 shadow-sm"><p className="font-semibold text-sm">{selectedProperty.name}</p><p className="mt-1 text-dash-text-muted text-xs">{selectedProperty.unit} · {selectedProperty.size}</p></div></div></div><div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-dash-border bg-dash-border sm:grid-cols-3">{[["Unit price", selectedProperty.price], ["Payment plan", "30% + 18 months"], ["Availability", "Immediate"]].map(([label, item]) => <div key={label} className="bg-white p-4"><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">{label}</p><p className="mt-2 font-semibold text-sm">{item}</p></div>)}</div><div className="mt-6 rounded-xl bg-dash-surface-secondary p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">Investment logic</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{["Sea-view demand supports short-term rental positioning", "New Boulevard matches the preferred investment area", "Flexible plan keeps acquisition inside target budget"].map((item) => <div key={item} className="flex gap-2 text-dash-text-secondary text-xs leading-5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-success" />{item}</div>)}</div></div></div></div>
      <aside className="space-y-4"><div className="rounded-2xl border border-dash-border bg-white p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">Presentation status</p><div className="mt-4 space-y-3">{["Buyer summary complete", "Selected unit verified", "Pricing and plan included"].map((item) => <div key={item} className="flex items-center gap-2 text-dash-text-secondary text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-dash-success" />{item}</div>)}</div></div><div className="rounded-2xl bg-slate-950 p-5 text-white"><ShieldCheck className="h-5 w-5 text-blue-400" /><h3 className="mt-4 font-semibold">Human approval required</h3><p className="mt-2 text-white/60 text-xs leading-5">A sales advisor reviews the recommendation before the presentation is shared with Maya.</p><div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-blue-200 text-xs"><Circle className="h-3 w-3 fill-current" />Awaiting advisor review</div></div></aside>
    </div>
  );
}

function HandoffStep({ approved, onApprove }: { approved: boolean; onApprove: () => void }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5"><div className="rounded-2xl border border-dash-border bg-white p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-dash-accent text-[10px] font-semibold uppercase tracking-[0.14em]">Sales-ready opportunity</p><h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold">{buyer.name} is ready for a human conversation.</h2><p className="mt-2 max-w-2xl text-dash-text-secondary text-sm leading-6">TwinO has qualified the buyer, selected the strongest-fit property and prepared the investment case.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 text-[10px] font-semibold">Ready for handoff</span></div><div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-dash-border sm:grid-cols-4">{[["Intent", "High"], ["Budget", "Confirmed"], ["Timeline", "This month"], ["Unit", selectedProperty.unit]].map(([label, item]) => <div key={label} className="bg-dash-surface-secondary p-4"><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">{label}</p><p className="mt-2 font-semibold text-sm">{item}</p></div>)}</div></div><div className="rounded-2xl border border-dash-border bg-white p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent-muted"><MessageCircle className="h-4 w-4 text-dash-accent" /></span><div><h3 className="font-semibold text-sm">Conversation summary</h3><p className="mt-1 text-dash-text-muted text-xs">Prepared automatically for the sales advisor</p></div></div><ul className="mt-5 grid gap-3 sm:grid-cols-2">{["Seeking a sea-view apartment for rental income", "Budget confirmed at $160k–$185k", "Prefers New Boulevard in Batumi", "Ready to move forward this month"].map((item) => <li key={item} className="flex gap-2 rounded-lg bg-dash-surface-secondary p-3 text-dash-text-secondary text-xs leading-5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />{item}</li>)}</ul></div></div>
      <aside className="space-y-4"><div className="rounded-2xl bg-slate-950 p-5 text-white"><Target className="h-5 w-5 text-blue-400" /><p className="mt-4 text-blue-300 text-[10px] font-semibold uppercase tracking-[0.14em]">Recommended next step</p><h3 className="mt-2 font-semibold">Confirm the selected unit and reservation terms.</h3><p className="mt-2 text-white/60 text-xs leading-5">Lead with Azure A-1204, then confirm the 30% reservation structure and answer final questions.</p></div><div className="rounded-2xl border border-dash-border bg-white p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">Assigned advisor</p><div className="mt-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700 text-xs">ER</span><div><p className="font-semibold text-sm">Elena Rossi</p><p className="mt-0.5 text-dash-text-muted text-xs">Senior Sales Advisor</p></div></div><button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-xs"><Handshake className="h-3.5 w-3.5" />Assigned to Elena</button><button type="button" onClick={onApprove} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-xs transition-colors ${approved ? "bg-emerald-600 text-white" : "bg-dash-accent text-white hover:bg-dash-accent-hover"}`}>{approved ? <><CheckCircle2 className="h-3.5 w-3.5" />Handoff approved</> : <><BadgeCheck className="h-3.5 w-3.5" />Approve handoff</>}</button></div></aside>
    </div>
  );
}

function ReservationStep() {
  const timeline = ["Buyer approved", "Unit held", "Escrow created", "Payment confirmed"];
  return (
    <div className="mx-auto max-w-6xl space-y-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-2xl border border-dash-border bg-white p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-dash-accent text-[10px] font-semibold uppercase tracking-[0.14em]">Reservation TW-2401</p><h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold">{selectedProperty.name} · {selectedProperty.unit}</h2><p className="mt-2 text-dash-text-secondary text-sm">Prepared for {buyer.name}</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 text-[10px] font-semibold">Payment pending</span></div><div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-dash-border bg-dash-border sm:grid-cols-2">{[["Buyer", buyer.name], ["Selected unit", `${selectedProperty.name} ${selectedProperty.unit}`], ["Unit price", selectedProperty.price], ["Reservation amount", "$5,000 USDC equivalent"]].map(([label, item]) => <div key={label} className="bg-white p-4"><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">{label}</p><p className="mt-2 font-semibold text-sm">{item}</p></div>)}</div></div><aside className="rounded-2xl bg-slate-950 p-5 text-white"><Clock3 className="h-5 w-5 text-blue-400" /><p className="mt-4 text-white/50 text-[10px] uppercase tracking-wider">Reservation hold</p><p className="mt-2 font-Helvetica-Neue text-3xl font-semibold">23:42:18</p><p className="mt-2 text-white/60 text-xs leading-5">Unit A-1204 is held while the reservation payment is secured.</p><div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-white/50 text-[9px] uppercase tracking-wider">Settlement</p><p className="mt-2 text-sm font-semibold">Developer receives USD fiat</p><p className="mt-1 text-white/50 text-xs">Handled by the configured payment partner</p></div></aside></div><div className="overflow-x-auto rounded-2xl border border-dash-border bg-white p-6"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-[0.14em]">Reservation status</p><div className="mt-6 flex min-w-[700px] items-center">{timeline.map((item, index) => <div key={item} className="flex flex-1 items-center last:flex-none"><div className="flex flex-col items-center"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${index < 2 ? "bg-dash-accent text-white" : index === 2 ? "border border-dash-accent bg-dash-accent-muted text-dash-accent" : "border border-dash-border text-dash-text-muted"}`}>{index < 2 ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`mt-2 text-xs font-medium ${index <= 2 ? "text-dash-text" : "text-dash-text-muted"}`}>{item}</span></div>{index < timeline.length - 1 && <span className={`mx-3 mb-5 h-px flex-1 ${index < 2 ? "bg-dash-accent" : "bg-dash-border"}`} />}</div>)}</div></div></div>
  );
}

function PaymentStep() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_18px_60px_rgba(16,185,129,0.08)]"><div className="bg-emerald-600 px-6 py-7 text-white"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-emerald-100 text-[10px] font-semibold uppercase tracking-[0.14em]"><ShieldCheck className="h-4 w-4" />Solana escrow secured</div><h2 className="mt-3 font-Helvetica-Neue text-3xl font-semibold tracking-tight">Reservation confirmed.</h2><p className="mt-2 text-emerald-50 text-sm">{buyer.name} · {selectedProperty.name} {selectedProperty.unit}</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600"><Check className="h-6 w-6" /></span></div></div><div className="p-6"><div className="grid gap-px overflow-hidden rounded-xl border border-dash-border bg-dash-border sm:grid-cols-2">{[["Escrow amount", "$5,000 USDC equivalent"], ["Network", "Solana"], ["Payment status", "Finalized"], ["Reservation", "TW-2401 confirmed"]].map(([label, item]) => <div key={label} className="bg-white p-4"><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">{label}</p><p className="mt-2 flex items-center gap-2 font-semibold text-sm">{item}{label === "Payment status" && <BadgeCheck className="h-4 w-4 text-emerald-600" />}</p></div>)}</div><div className="mt-5 rounded-xl bg-dash-surface-secondary p-5"><div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">Buyer commitment</p><p className="mt-2 font-semibold text-sm">USDC secured in escrow</p></div><ChevronRight className="hidden h-5 w-5 text-dash-text-muted sm:block" /><div><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">Developer settlement</p><p className="mt-2 font-semibold text-sm">USD fiat payout initiated</p></div></div></div><div className="mt-5 flex items-center justify-between gap-4 border-dash-border border-t pt-5"><div><p className="text-dash-text-muted text-[9px] uppercase tracking-wider">Solana transaction</p><p className="mt-1 font-mono text-dash-text-secondary text-xs">5YpK…4jQe · Finalized</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 text-[10px] font-semibold">Escrow active</span></div></div></div><aside className="space-y-4"><div className="rounded-2xl bg-slate-950 p-5 text-white"><CircleDollarSign className="h-5 w-5 text-blue-400" /><p className="mt-4 text-blue-300 text-[10px] font-semibold uppercase tracking-[0.14em]">Conversion complete</p><h3 className="mt-2 font-semibold text-lg">From inquiry to secured commitment.</h3><p className="mt-2 text-white/60 text-xs leading-5">TwinO qualified the buyer, matched the property, prepared the case, enabled human approval and secured the reservation.</p></div><div className="rounded-2xl border border-dash-border bg-white p-5"><p className="text-dash-text-muted text-[10px] font-semibold uppercase tracking-wider">Final status</p><div className="mt-4 space-y-3">{[["Buyer", "Confirmed"], ["Unit", "Reserved"], ["Escrow", "Secured"], ["Fiat settlement", "Initiated"]].map(([label, status]) => <div key={label} className="flex items-center justify-between gap-3"><span className="text-dash-text-secondary text-xs">{label}</span><span className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" />{status}</span></div>)}</div></div><div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="flex items-center gap-2 text-blue-900 text-xs font-semibold"><Banknote className="h-4 w-4 text-blue-600" />Developer receives fiat</p><p className="mt-2 text-blue-800/70 text-xs leading-5">The settlement partner converts and delivers the developer payout in USD.</p></div></aside></div>
  );
}

function Avatar({ large = false }: { large?: boolean }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-semibold text-dash-accent ${large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"}`}>{buyer.initials}</span>;
}
