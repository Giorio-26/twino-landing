"use client";

import {
  ArrowRight,
  CalendarCheck,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("common.hero");

  return (
    <section className="mt-2 flex h-full items-center justify-center pt-32 pb-20 sm:mt-14 md:mt-0 md:h-screen lg:pt-48 lg:pb-32">
      <div className="container z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col items-start">
          <h1 className="mb-6 font-Helvetica-Neue font-bold text-primary text-xl leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mb-8 max-w-xl font-Helvetica text-primary/70 text-sm leading-relaxed sm:text-lg">
            {t("description")}
          </p>

          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="#pilot"
              className="group hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-base text-white no-underline transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,114,255,0.2)] sm:w-auto"
            >
              {t("ctaPilot")}
              <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#demo-video"
              className="group hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-8 py-3.5 font-semibold text-base text-primary no-underline transition-all duration-250 ease-in-out hover:border-black/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:w-auto"
            >
              <Play className="size-4 fill-primary text-primary transition-transform duration-250 ease-out group-hover:scale-110" />
              {t("ctaDemo")}
            </Link>
          </div>
        </div>

        <div className="perspective-1000 relative flex flex-col gap-8 transition-transform duration-700 ease-out lg:pl-12">
          {/* Card 1 */}
          <div className="hover:-translate-y-1 relative z-30 flex flex-col items-start gap-5 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-2xl sm:flex-row lg:translate-x-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
              <Zap className="size-6" />
            </div>
            <div>
              <div className="mb-1 font-Helvetica-Neue font-bold text-lg text-primary sm:text-2xl">
                {t("card1Value")}
              </div>
              <div className="font-Helvetica text-primary/70 text-sm">
                {t("card1Label")}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="hover:-translate-y-1 relative z-20 flex flex-col items-start gap-5 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-2xl sm:flex-row lg:translate-x-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CalendarCheck className="size-6" />
            </div>
            <div>
              <div className="mb-1 font-Helvetica-Neue font-bold text-lg text-primary sm:text-2xl">
                {t("card2Value")}
              </div>
              <div className="font-Helvetica text-primary/70 text-sm">
                {t("card2Label")}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="hover:-translate-y-1 relative z-10 flex flex-col items-start gap-5 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-2xl sm:flex-row lg:translate-x-16">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="mb-1 font-Helvetica-Neue font-bold text-lg text-primary sm:text-2xl">
                {t("card3Value")}
              </div>
              <div className="font-Helvetica text-primary/70 text-sm">
                {t("card3Label")}
              </div>
            </div>
          </div>

          {/* Background decorative blob */}
          <div className="-z-10 -translate-y-1/2 absolute top-1/2 right-[10vw] h-64 w-64 rounded-full bg-accent/20 blur-3xl lg:right-20 lg:h-96 lg:w-96" />
        </div>
      </div>
    </section>
  );
}
