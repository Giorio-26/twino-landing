"use client";

import { BarChart3, Bot, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FeaturesSection() {
  const t = useTranslations("common.features");

  const features = [
    {
      icon: Bot,
      title: t("card1Title"),
      description: t("card1Description"),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: t("card2Title"),
      description: t("card2Description"),
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: Shield,
      title: t("card3Title"),
      description: t("card3Description"),
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <section className="py-24 md:py-32 lg:py-40">
      <div className="container">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 font-Helvetica-Neue font-bold text-3xl text-primary leading-tight sm:text-4xl lg:text-5xl">
            {t("title")}
            <br />
            {t("subtitle")}
          </h2>
          <p className="mx-auto max-w-2xl font-Helvetica text-base text-primary/70 leading-relaxed sm:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group hover:-translate-y-1 flex flex-col items-start gap-6 rounded-2xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-2xl"
              >
                {/* Icon */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${feature.iconBg} ${feature.iconColor}`}
                >
                  <Icon className="size-7" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-Helvetica-Neue font-bold text-primary text-xl sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="font-Helvetica text-primary/70 text-sm leading-relaxed sm:text-base">
                    {feature.description}
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
