"use client";

import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  CircleDollarSign,
  Database,
  Loader2,
  Plug,
  Save,
  Settings2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

type CompanyData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const inputClass =
  "mt-2 w-full rounded-lg border border-dash-border bg-white px-3.5 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-dash-text-muted focus:border-dash-accent";

const setupSections = [
  {
    title: "Sales Twin",
    icon: Bot,
    href: "/dashboard/configure",
    rows: [
      ["Qualification rules", "Review configuration"],
      ["Human handoff rules", "Review configuration"],
      ["Presentation defaults", "Setup required"],
    ],
  },
  {
    title: "Integrations",
    icon: Plug,
    href: "/dashboard/integration",
    rows: [
      ["WhatsApp", "Review connection"],
      ["Meta", "Setup required"],
      ["CRM", "Setup required"],
    ],
  },
  {
    title: "Inventory",
    icon: Database,
    href: "/dashboard/properties",
    rows: [
      ["Data source", "Workspace inventory"],
      ["Synchronization", "Setup required"],
    ],
  },
];

export default function SettingsClient({ initialCompany }: { initialCompany: CompanyData | null }) {
  const [company, setCompany] = useState({
    name: initialCompany?.name ?? "",
    email: initialCompany?.email ?? "",
    phone: initialCompany?.phone ?? "",
    website: initialCompany?.website ?? "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function saveCompany() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/dashboard/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      if (!response.ok) throw new Error();
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setTimeout(() => setSaveState("idle"), 2500);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-dash-border border-b pb-6">
        <p className="font-medium text-dash-accent text-xs uppercase tracking-wider">System</p>
        <h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">Settings</h2>
        <p className="mt-2 max-w-2xl text-dash-text-secondary text-sm">Manage your company, Sales Twin, integrations, inventory and conversion settings.</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-dash-border bg-white">
        <div className="flex items-start gap-3 border-dash-border border-b px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent-muted"><Building2 className="h-4 w-4 text-dash-accent" /></div>
          <div><h3 className="font-semibold text-dash-text text-sm">Company profile</h3><p className="mt-1 text-dash-text-muted text-xs">Details used across your TwinO workspace.</p></div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {[
            { key: "name", label: "Company name", type: "text", placeholder: "Company name" },
            { key: "email", label: "Email", type: "email", placeholder: "team@company.com" },
            { key: "phone", label: "Phone", type: "tel", placeholder: "+995" },
            { key: "website", label: "Website", type: "url", placeholder: "https://" },
          ].map((field) => (
            <label key={field.key} className="text-dash-text-secondary text-xs font-medium">
              {field.label}
              <input
                type={field.type}
                value={company[field.key as keyof typeof company]}
                onChange={(event) => setCompany((current) => ({ ...current, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-dash-border border-t px-5 py-4">
          <p className={`text-xs ${saveState === "error" ? "text-dash-danger" : "text-dash-text-muted"}`}>
            {saveState === "error" ? "Changes could not be saved." : saveState === "saved" ? "Company details saved." : "Only verified company details are displayed elsewhere."}
          </p>
          <button type="button" onClick={saveCompany} disabled={saveState === "saving"} className="inline-flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm disabled:opacity-60">
            {saveState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : saveState === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveState === "saving" ? "Saving" : saveState === "saved" ? "Saved" : "Save company"}
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {setupSections.map(({ title, icon: Icon, href, rows }) => (
          <section key={title} className="flex flex-col rounded-xl border border-dash-border bg-white p-5">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><Icon className="h-4 w-4 text-slate-600" /></div><h3 className="font-semibold text-dash-text text-sm">{title}</h3></div>
            <dl className="mt-5 flex-1 divide-y divide-dash-border">
              {rows.map(([label, status]) => <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0"><dt className="text-dash-text-secondary text-xs">{label}</dt><dd className={`text-right text-[11px] font-medium ${status === "Setup required" ? "text-dash-text-muted" : "text-dash-accent"}`}>{status}</dd></div>)}
            </dl>
            <Link href={href} className="mt-4 inline-flex items-center gap-1.5 border-dash-border border-t pt-4 font-semibold text-dash-accent text-xs no-underline">Open settings<ArrowRight className="h-3.5 w-3.5" /></Link>
          </section>
        ))}
      </div>

      <section className="grid overflow-hidden rounded-xl border border-dash-border bg-white sm:grid-cols-3">
        {[
          { icon: Users, title: "Team", text: "Invite teammates and manage roles when team access is enabled." },
          { icon: Settings2, title: "Reservations", text: "Set the default amount, expiry and approval rules." },
          { icon: CircleDollarSign, title: "Payments", text: "Connect the provider used to verify reservation payments." },
        ].map(({ icon: Icon, title, text }, index) => (
          <div key={title} className={`p-5 ${index > 0 ? "border-dash-border border-t sm:border-t-0 sm:border-l" : ""}`}>
            <Icon className="h-4 w-4 text-dash-text-muted" />
            <h3 className="mt-4 font-semibold text-dash-text text-sm">{title}</h3>
            <p className="mt-2 text-dash-text-muted text-xs leading-5">{text}</p>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Setup required</span>
          </div>
        ))}
      </section>
    </div>
  );
}
