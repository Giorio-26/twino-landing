"use client";

import {
  MessageSquare,
  Database,
  CalendarCheck,
  Building2,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function DifferentiatorsSection() {
  const t = useTranslations("common.differentiators");
  const section = useScrollAnimation(0.1);

  const cards = [
    {
      icon: MessageSquare,
      title: t("card1Title"),
      description: t("card1Description"),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Database,
      title: t("card2Title"),
      description: t("card2Description"),
      color: "text-accent",
      bg: "bg-accent/5",
    },
    {
      icon: CalendarCheck,
      title: t("card3Title"),
      description: t("card3Description"),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Building2,
      title: t("card4Title"),
      description: t("card4Description"),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: ShieldCheck,
      title: t("card5Title"),
      description: t("card5Description"),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: Layers,
      title: t("card6Title"),
      description: t("card6Description"),
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <section className="py-24 md:py-32 lg:py-40 bg-gray-50/50">
      <div className="container">
        {/* Header */}
        <div
          ref={section.ref}
          className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-Helvetica-Neue font-bold text-primary text-3xl leading-tight sm:text-4xl lg:text-5xl mb-4">
            {t("title")}
          </h2>
          <p className="font-Helvetica text-secondary text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="group hover:-translate-y-1 flex flex-col items-start gap-5 rounded-2xl border border-primary/5 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/10"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${card.bg}`}
                >
                  <Icon className={`size-6 ${card.color}`} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-Helvetica-Neue font-bold text-primary text-lg">
                    {card.title}
                  </h3>
                  <p className="font-Helvetica text-secondary text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
