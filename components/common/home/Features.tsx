"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function FeaturesSection() {
  const t = useTranslations("common.differentiators");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    const el = document.getElementById("product");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null; // Features are now rendered as DifferentiatorsSection
}
