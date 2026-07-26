"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function WhyNowSection() {
  const t = useTranslations("common.whyNow");
  const section = useScrollAnimation(0.15);

  return (
    <section id="why-twino" className="py-24 md:py-32">
      <div className="container">
        <div
          ref={section.ref}
          className={`max-w-4xl mx-auto transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="font-Helvetica-Neue font-bold text-primary text-3xl leading-tight sm:text-4xl mb-6">
                {t("title")}
              </h2>
              <div className="space-y-4">
                <p className="font-Helvetica text-secondary text-base leading-relaxed">
                  {t("p1")}
                </p>
                <p className="font-Helvetica text-secondary text-base leading-relaxed">
                  {t("p2")}
                </p>
              </div>
            </div>

            {/* Right - Highlight card */}
            <div className="rounded-2xl bg-primary p-10 text-white hover:shadow-2xl transition-shadow duration-300">
              <div className="text-accent font-bold text-sm uppercase tracking-wider mb-4">
                The market has shifted
              </div>
              <p className="font-Helvetica-Neue font-bold text-2xl leading-snug mb-6">
                {t("highlight")}
              </p>
              <div className="w-16 h-1 bg-accent rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
