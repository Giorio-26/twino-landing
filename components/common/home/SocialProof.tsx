"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Placeholder logos for now — replace with actual client logos when available
const placeholderLogos = [
  { name: "Developer Co. 1", initials: "DC" },
  { name: "Agency Group", initials: "AG" },
  { name: "Estate Partners", initials: "EP" },
  { name: "Prime Realty", initials: "PR" },
  { name: "Metro Homes", initials: "MH" },
  { name: "Coastal Dev", initials: "CD" },
];

export default function SocialProofSection() {
  const t = useTranslations("common.socialProof");
  const section = useScrollAnimation(0.1);

  return (
    <section id="product" className="py-16 border-y border-primary/5">
      <div className="container">
        <div
          ref={section.ref}
          className={`text-center mb-10 transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="font-medium text-sm text-muted uppercase tracking-wider">
            {t("companyLabel")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {placeholderLogos.map((logo, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 opacity-40 hover:opacity-70 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
    </section>
  );
}
