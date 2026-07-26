"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const t = useTranslations("common.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const section = useScrollAnimation(0.1);

  const faqs: FAQItem[] = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
    { question: t("q5"), answer: t("a5") },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div
          ref={section.ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-Helvetica-Neue font-bold text-primary text-3xl leading-tight sm:text-4xl mb-12 text-center">
            {t("title")}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  openIndex === i
                    ? "border-accent/20 bg-white shadow-md"
                    : "border-primary/5 bg-white hover:border-primary/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-Helvetica-Neue font-semibold text-primary text-base pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`size-5 shrink-0 transition-transform duration-300 ${
                      openIndex === i
                        ? "rotate-180 text-accent"
                        : "text-muted"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === i ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="px-6 font-Helvetica text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
