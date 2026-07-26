"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const placeholderLogos = [
  { name: "Developer Co. 1", initials: "DC" },
  { name: "Agency Group", initials: "AG" },
  { name: "Estate Partners", initials: "EP" },
  { name: "Prime Realty", initials: "PR" },
  { name: "Metro Homes", initials: "MH" },
  { name: "Coastal Dev", initials: "CD" },
  { name: "Summit Real Estate", initials: "SR" },
  { name: "Urban Properties", initials: "UP" },
];

export default function TractionSection() {
  const t = useTranslations("common.traction");
  const section = useScrollAnimation(0.1);

  return (
    <section className="py-24 md:py-32 bg-gray-50/50">
      <div className="container">
        <div
          ref={section.ref}
          className={`transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="font-Helvetica-Neue font-bold text-primary text-3xl leading-tight sm:text-4xl lg:text-5xl mb-4">
              {t("title")}
            </h2>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            {[
              { value: t("metric1Value"), label: t("metric1Label") },
              { value: t("metric2Value"), label: t("metric2Label") },
              { value: t("metric3Value"), label: t("metric3Label") },
            ].map((metric, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-primary/5 p-8 text-center shadow-sm hover:shadow-lg hover:border-accent/10 transition-all duration-300"
              >
                <div className="font-Helvetica-Neue font-bold text-4xl text-accent mb-2">
                  {metric.value}
                </div>
                <p className="font-Helvetica text-secondary text-sm">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          {/* Logo grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
            {placeholderLogos.map((logo, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-sm text-primary">
                    {logo.initials}
                  </span>
                </div>
                <span className="text-xs text-muted font-medium">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
