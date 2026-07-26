"use client";

import { ArrowRight, Play, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const t = useTranslations("common.hero");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,114,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,114,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,114,255,0.08),transparent)]" />

      <div
        className={`container relative z-10 transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-sm text-secondary">
              {t("trustLine")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-Helvetica-Neue font-bold text-primary text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            {t("title")}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl font-Helvetica text-secondary text-lg leading-relaxed sm:text-xl mb-10">
            {t("description")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#book-demo"
              className="group hover:-translate-y-0.5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-base text-white no-underline transition-all duration-250 ease-in-out hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] active:translate-y-0"
            >
              {t("ctaDemo")}
              <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="group hover:-translate-y-0.5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary/10 bg-white px-8 py-4 font-semibold text-base text-primary no-underline transition-all duration-250 ease-in-out hover:border-primary/20 hover:shadow-lg active:translate-y-0"
            >
              <Play className="size-4 fill-primary text-primary transition-transform duration-250 ease-out group-hover:scale-110" />
              {t("ctaPilot")}
            </Link>
          </div>
        </div>

        {/* Product preview mockup */}
        <div
          className={`mt-16 max-w-5xl mx-auto transition-all duration-1200 ease-out delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="relative rounded-2xl border border-primary/10 bg-white shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-primary/5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-300" />
                <div className="h-3 w-3 rounded-full bg-amber-300" />
                <div className="h-3 w-3 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 ml-4 h-6 rounded-md bg-gray-100 border border-gray-200 flex items-center px-3">
                <span className="text-xs text-gray-400 font-mono">
                  twino.estate/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="grid grid-cols-12 gap-0">
              {/* Sidebar */}
              <div className="hidden md:block col-span-2 bg-gray-50 border-r border-primary/5 p-4 space-y-3">
                <div className="h-6 w-20 rounded bg-primary/5" />
                <div className="space-y-2 mt-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-4 rounded ${
                        i === 1
                          ? "bg-accent/10 border border-accent/20 w-3/4"
                          : "bg-gray-100 w-full"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="col-span-12 md:col-span-10 p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Leads", value: "142", change: "+12%" },
                    { label: "Booked Today", value: "28", change: "+8%" },
                    { label: "Response Time", value: "<3s", change: "99.9%" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-primary/5 bg-white p-3 shadow-sm"
                    >
                      <div className="text-xs text-muted mb-1">
                        {stat.label}
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="font-bold text-xl text-primary">
                          {stat.value}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lead list mockup */}
                <div className="rounded-lg border border-primary/5 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-24 rounded bg-gray-100" />
                    <div className="h-6 w-16 rounded-md bg-accent/10" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { status: "qualified", name: "Giorgi K.", source: "WhatsApp" },
                      { status: "new", name: "Ana M.", source: "Instagram" },
                      { status: "booked", name: "Davit L.", source: "Messenger" },
                      { status: "qualified", name: "Nino S.", source: "WhatsApp" },
                    ].map((lead, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-muted">
                              {lead.name[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary">
                              {lead.name}
                            </div>
                            <div className="text-xs text-muted">{lead.source}</div>
                          </div>
                        </div>
                        <div
                          className={`h-5 w-16 rounded-full text-xs flex items-center justify-center font-medium ${
                            lead.status === "qualified"
                              ? "bg-emerald-50 text-emerald-700"
                              : lead.status === "booked"
                                ? "bg-accent/10 text-accent"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {lead.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating accent glow */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-accent/5 via-transparent to-accent/5 blur-xl" />
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-10">
          <div className="animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
