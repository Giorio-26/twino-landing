"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 },
    );

    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const numMatch = target.match(/[\d.]+/);
    if (!numMatch) return;
    const targetNum = parseFloat(numMatch[0]);
    const isFloat = target.includes(".");
    const duration = 1500;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * eased;

      if (isFloat) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }

      if (progress >= 1) {
        clearInterval(timer);
        setCount(targetNum);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={counterRef}>
      {target.startsWith("<") ? `<` : ""}
      {count}
      {suffix}
    </div>
  );
}

export default function ProblemSection() {
  const t = useTranslations("common.problem");
  const section = useScrollAnimation(0.15);

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div
          ref={section.ref}
          className={`max-w-4xl mx-auto transition-all duration-700 ease-out ${
            section.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Headline */}
          <h2 className="font-Helvetica-Neue font-bold text-primary text-3xl leading-tight sm:text-4xl lg:text-5xl mb-8">
            {t("title")}
          </h2>

          {/* Body */}
          <div className="space-y-5 mb-16">
            <p className="font-Helvetica text-secondary text-lg leading-relaxed">
              {t("p1")}
            </p>
            <p className="font-Helvetica text-secondary text-lg leading-relaxed">
              {t("p2")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: t("stat1Value"), label: t("stat1Label") },
              { value: t("stat2Value"), label: t("stat2Label") },
              { value: t("stat3Value"), label: t("stat3Label") },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl border border-red-500/10 bg-red-500/5 p-6 hover:border-red-500/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="font-Helvetica-Neue font-bold text-3xl text-red-600 mb-2">
                  <AnimatedCounter target={stat.value} />
                </div>
                <p className="font-Helvetica text-secondary text-sm leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
