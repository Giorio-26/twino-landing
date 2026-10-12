"use client";

import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  FileCheck2,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  WalletCards,
} from "lucide-react";
import { useLocale } from "next-intl";

const copy = {
  en: {
    eyebrow: "AI sales infrastructure for residential developers",
    title: "Turn high-intent property inquiries into paid reservations.",
    intro: "TwinO qualifies buyers, matches the right units, prepares personalized investment presentations, and keeps a human in control before reservation and payment.",
    demo: "Book a Demo",
    product: "See Product",
    problemEyebrow: "The conversion gap",
    problemTitle: "Buyer momentum disappears between first response and commitment.",
    problemBody: "High-intent buyers expect relevance immediately. Sales teams need more than a chatbot: they need structured qualification, inventory context, a compelling investment case, and a clear route to reservation.",
    flowEyebrow: "One focused workflow",
    flowTitle: "Every step moves the buyer closer to a decision.",
    previewEyebrow: "The operating layer",
    previewTitle: "A clear workspace for the moments that matter.",
    previewBody: "See qualified intent, shortlist live inventory, prepare the buyer case, and keep approvals visible without replacing the CRM your team already uses.",
    whyEyebrow: "Why TwinO",
    whyTitle: "Built around developer sales, not generic support.",
    reservationEyebrow: "Reservation layer",
    reservationTitle: "AI drives conversion. Solana secures the commitment.",
    reservationBody: "The sales journey stays familiar. Solana appears only at the final payment layer, where a configured provider can support transparent reservation funding and confirmation.",
  },
  ka: {
    eyebrow: "AI გაყიდვების ინფრასტრუქტურა საცხოვრებელი დეველოპერებისთვის",
    title: "გადააქციეთ მაღალი ინტერესის მქონე მოთხოვნები გადახდილ რეზერვაციებად.",
    intro: "TwinO აკვალიფიცირებს მყიდველებს, არჩევს შესაბამის ერთეულებს, ამზადებს პერსონალიზებულ საინვესტიციო პრეზენტაციებს და რეზერვაციამდე ინარჩუნებს ადამიანის კონტროლს.",
    demo: "დაჯავშნეთ დემო",
    product: "ნახეთ პროდუქტი",
    problemEyebrow: "კონვერსიის დანაკარგი",
    problemTitle: "მყიდველის ინტერესი იკარგება პირველ პასუხსა და გადაწყვეტილებას შორის.",
    problemBody: "მაღალი ინტერესის მქონე მყიდველს მყისიერი და რელევანტური პასუხი სჭირდება. გაყიდვების გუნდს სჭირდება სტრუქტურირებული კვალიფიკაცია, ინვენტარის კონტექსტი და მკაფიო გზა რეზერვაციამდე.",
    flowEyebrow: "ერთი გამართული პროცესი",
    flowTitle: "ყოველი ნაბიჯი მყიდველს გადაწყვეტილებასთან აახლოებს.",
    previewEyebrow: "ოპერაციული ფენა",
    previewTitle: "მკაფიო სამუშაო სივრცე მნიშვნელოვანი მომენტებისთვის.",
    previewBody: "იხილეთ კვალიფიცირებული ინტერესი, შეარჩიეთ რეალური ინვენტარი, მოამზადეთ შეთავაზება და აკონტროლეთ დამტკიცება არსებული CRM-ის ჩანაცვლების გარეშე.",
    whyEyebrow: "რატომ TwinO",
    whyTitle: "შექმნილია დეველოპერის გაყიდვებისთვის და არა ზოგადი მხარდაჭერისთვის.",
    reservationEyebrow: "რეზერვაციის ფენა",
    reservationTitle: "AI ზრდის კონვერსიას. Solana უზრუნველყოფს ვალდებულებას.",
    reservationBody: "გაყიდვების პროცესი რჩება ნაცნობი. Solana ჩნდება მხოლოდ გადახდის ბოლო ეტაპზე, სადაც კონფიგურირებული პროვაიდერი უზრუნველყოფს რეზერვაციის დაფინანსებასა და დადასტურებას.",
  },
};

const steps = [
  { title: "Inquiry", icon: MessageCircle },
  { title: "Qualification", icon: Bot },
  { title: "Property match", icon: Building2 },
  { title: "Presentation", icon: FileText },
  { title: "Human approval", icon: UserCheck },
  { title: "Reservation", icon: FileCheck2 },
  { title: "Payment", icon: WalletCards },
];

export default function PivotLanding() {
  const locale = useLocale();
  const text = locale === "ka" ? copy.ka : copy.en;

  return (
    <>
      <section className="overflow-hidden bg-white pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container">
          <div className="grid items-center gap-14 lg:grid-cols-[.92fr_1.08fr]">
            <div>
              <p className="font-semibold text-accent text-xs uppercase tracking-[0.16em]">{text.eyebrow}</p>
              <h1 className="mt-6 max-w-3xl font-Helvetica-Neue font-bold text-4xl text-primary leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">{text.title}</h1>
              <p className="mt-6 max-w-xl font-Helvetica text-base text-secondary leading-7 sm:text-lg">{text.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#book-demo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-sm text-white no-underline transition-transform hover:-translate-y-0.5">{text.demo}<ArrowRight className="h-4 w-4" /></a>
                <a href="#product" className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-3 font-semibold text-primary text-sm no-underline hover:bg-slate-50">{text.product}</a>
              </div>
              <div className="mt-10 flex items-center gap-3 border-black/8 border-t pt-5 text-secondary text-xs"><ShieldCheck className="h-4 w-4 text-accent" />Human approval stays in the conversion loop.</div>
            </div>

            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="border-black/5 border-y bg-slate-50 py-20 sm:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="font-semibold text-accent text-xs uppercase tracking-[0.16em]">{text.problemEyebrow}</p>
            <h2 className="mt-4 font-Helvetica-Neue font-bold text-3xl text-primary tracking-[-0.025em] sm:text-4xl">{text.problemTitle}</h2>
          </div>
          <p className="max-w-2xl font-Helvetica text-secondary text-base leading-7 lg:justify-self-end">{text.problemBody}</p>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 sm:py-28">
        <div className="container">
          <p className="text-center font-semibold text-accent text-xs uppercase tracking-[0.16em]">{text.flowEyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-Helvetica-Neue font-bold text-3xl text-primary tracking-[-0.025em] sm:text-4xl">{text.flowTitle}</h2>
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-black/8 bg-white sm:grid-cols-2 lg:grid-cols-7">
            {steps.map(({ title, icon: Icon }, index) => (
              <div key={title} className="relative min-h-36 border-black/8 border-b p-5 last:border-b-0 sm:odd:border-r lg:border-r lg:border-b-0 lg:last:border-r-0">
                <span className="text-black/30 text-[10px] font-semibold">0{index + 1}</span>
                <Icon className={`mt-7 h-5 w-5 ${index === steps.length - 1 ? "text-accent" : "text-primary"}`} />
                <p className="mt-3 font-semibold text-primary text-sm">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="bg-primary py-20 text-white sm:py-28">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-semibold text-blue-400 text-xs uppercase tracking-[0.16em]">{text.previewEyebrow}</p>
              <h2 className="mt-4 font-Helvetica-Neue font-bold text-3xl tracking-[-0.025em] sm:text-4xl">{text.previewTitle}</h2>
            </div>
            <p className="max-w-2xl text-white/60 text-base leading-7 lg:justify-self-end">{text.previewBody}</p>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white text-primary shadow-2xl shadow-blue-950/30">
            <div className="flex h-12 items-center gap-2 border-black/8 border-b bg-slate-50 px-4"><span className="h-2.5 w-2.5 rounded-full bg-black/10" /><span className="h-2.5 w-2.5 rounded-full bg-black/10" /><span className="h-2.5 w-2.5 rounded-full bg-black/10" /><span className="ml-3 text-black/35 text-[10px] font-medium">TwinO / Buyer workspace</span></div>
            <div className="grid min-h-96 lg:grid-cols-[190px_1fr_280px]">
              <div className="hidden border-black/8 border-r bg-slate-50 p-4 lg:block">
                <div className="mb-7 h-5 w-20 rounded bg-black/10" />
                {["Overview", "Leads", "Presentations", "Reservations", "Properties"].map((item, index) => <div key={item} className={`mb-2 rounded-lg px-3 py-2.5 text-xs font-medium ${index === 1 ? "bg-blue-50 text-accent" : "text-black/45"}`}>{item}</div>)}
              </div>
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between border-black/8 border-b pb-5"><div><p className="text-black/35 text-[10px] uppercase tracking-wider">Buyer profile</p><div className="mt-2 h-6 w-36 rounded bg-primary/10" /></div><span className="rounded-md bg-accent px-3 py-2 text-white text-[10px] font-semibold">Find matches</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">{["Budget", "Intent", "Preferred location", "Timeline"].map((label) => <div key={label} className="rounded-lg border border-black/8 p-4"><p className="text-black/35 text-[10px]">{label}</p><div className="mt-3 h-2.5 w-2/3 rounded bg-black/10" /></div>)}</div>
                <div className="mt-5 rounded-lg border border-black/8 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-xs">Conversation context</p><span className="text-black/35 text-[10px]">Verified data only</span></div><div className="mt-4 h-2.5 w-full rounded bg-black/8" /><div className="mt-2 h-2.5 w-4/5 rounded bg-black/8" /></div>
              </div>
              <div className="border-black/8 border-t bg-slate-50 p-5 lg:border-t-0 lg:border-l">
                <p className="font-semibold text-xs">Qualification</p>
                <div className="mt-4 rounded-lg border border-black/8 bg-white p-4"><p className="text-black/35 text-[10px]">Structured status</p><div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-accent text-[10px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Ready for review</div></div>
                <div className="mt-4 rounded-lg bg-primary p-4 text-white"><Target className="h-4 w-4 text-blue-400" /><p className="mt-5 font-semibold text-xs">Next action</p><p className="mt-2 text-white/55 text-[10px] leading-4">Review available inventory and prepare a focused shortlist.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-twino" className="bg-white py-20 sm:py-28">
        <div className="container">
          <p className="font-semibold text-accent text-xs uppercase tracking-[0.16em]">{text.whyEyebrow}</p>
          <h2 className="mt-4 max-w-2xl font-Helvetica-Neue font-bold text-3xl text-primary tracking-[-0.025em] sm:text-4xl">{text.whyTitle}</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-black/8 bg-black/8 md:grid-cols-3">
            {[{ icon: Bot, title: "24/7 qualification", body: "Respond instantly and turn natural conversations into structured buyer context." }, { icon: Sparkles, title: "Relevant unit matching", body: "Give the sales team real inventory and buyer needs in the same focused workspace." }, { icon: UserCheck, title: "Human-approved conversion", body: "Keep people in control before any presentation, reservation or payment progresses." }].map(({ icon: Icon, title, body }) => <div key={title} className="bg-white p-7"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><Icon className="h-4 w-4 text-accent" /></div><h3 className="mt-6 font-semibold text-primary">{title}</h3><p className="mt-3 text-secondary text-sm leading-6">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="container">
          <div className="overflow-hidden rounded-3xl bg-primary p-8 text-white sm:p-12 lg:p-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_.8fr]">
              <div><p className="font-semibold text-blue-400 text-xs uppercase tracking-[0.16em]">{text.reservationEyebrow}</p><h2 className="mt-5 max-w-2xl font-Helvetica-Neue font-bold text-3xl tracking-[-0.025em] sm:text-4xl">{text.reservationTitle}</h2><p className="mt-5 max-w-2xl text-white/60 text-sm leading-7">{text.reservationBody}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                {["Human-approved reservation", "Provider-neutral payment state", "Funded and confirmed status"].map((item, index) => <div key={item} className="flex items-center gap-3 border-white/10 border-b py-4 first:pt-0 last:border-b-0 last:pb-0"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${index === 0 ? "bg-accent" : "border border-white/15"}`}>{index === 0 ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="text-white/75 text-sm">{item}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 -z-10 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.12)]">
        <div className="flex h-12 items-center justify-between border-black/8 border-b bg-slate-50 px-4"><span className="text-black/35 text-[10px] font-semibold uppercase tracking-wider">Sales workspace</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 text-[10px] font-semibold">Live inventory</span></div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-5"><div><p className="text-black/35 text-[10px] uppercase tracking-wider">Needs attention</p><h3 className="mt-2 font-Helvetica-Neue font-semibold text-xl text-primary">Move qualified buyers forward</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><Bot className="h-4 w-4 text-accent" /></div></div>
          <div className="mt-7 grid grid-cols-3 gap-3">{["Active leads", "Qualified", "Reservations"].map((label, index) => <div key={label} className="rounded-lg border border-black/8 p-3"><p className="text-black/35 text-[9px]">{label}</p><p className="mt-3 text-sm font-semibold text-primary">{index < 2 ? "Live" : "Setup"}</p></div>)}</div>
          <div className="mt-5 overflow-hidden rounded-xl border border-black/8">
            <div className="grid grid-cols-[1fr_.8fr_auto] bg-slate-50 px-4 py-3 text-black/35 text-[9px] uppercase tracking-wider"><span>Buyer</span><span>Stage</span><span>Action</span></div>
            {["Qualification complete", "Inventory review", "Approval required"].map((stage, index) => <div key={stage} className="grid grid-cols-[1fr_.8fr_auto] items-center border-black/8 border-t px-4 py-3"><div className="flex items-center gap-2"><span className="h-7 w-7 rounded-full bg-slate-100" /><span className="h-2 w-14 rounded bg-black/10" /></div><span className="text-secondary text-[10px]">{stage}</span><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${index === 0 ? "bg-blue-50 text-accent" : "bg-slate-100 text-slate-500"}`}>{index === 0 ? "Open" : "Review"}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
