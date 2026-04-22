"use client";

import { Building2, Globe, Shield, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import GuardiansTab from "@/components/dashboard/configure/GuardiansTab";
import KnowledgeTab from "@/components/dashboard/configure/KnowledgeTab";
import PersonalityTab from "@/components/dashboard/configure/PersonalityTab";
import PropertiesTab from "@/components/dashboard/configure/PropertiesTab";
import {
  apiFetch,
  DEFAULT_CONFIG,
  type TwinConfig,
} from "@/components/dashboard/configure/shared";

const TAB_ICONS = {
  personality: Sparkles,
  guardians: Shield,
  knowledge: Globe,
  properties: Building2,
} as const;

type TabId = keyof typeof TAB_ICONS;

const TAB_IDS = Object.keys(TAB_ICONS) as TabId[];

export default function ConfigureTwinPage() {
  const t = useTranslations("dashboard.configure");

  const [activeTab, setActiveTab] = useState<TabId>("personality");
  const [config, setConfig] = useState<TwinConfig>(DEFAULT_CONFIG);
  const [initialLoading, setInitialLoading] = useState(true);
  const visited = useRef<Set<TabId>>(new Set(["personality"]));

  useEffect(() => {
    apiFetch<TwinConfig>("/api/twin-config").then((res) => {
      if (res.data) setConfig(res.data);
      setInitialLoading(false);
    });
  }, []);

  const handleTabChange = (id: TabId) => {
    visited.current.add(id);
    setActiveTab(id);
  };

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-dash-surface-secondary" />
        <div className="h-12 animate-pulse rounded-2xl bg-dash-surface-secondary" />
        <div className="h-64 animate-pulse rounded-2xl bg-dash-surface-secondary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          {t("pageTitle")}
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          {t("pageSubtitle")}
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-2xl bg-dash-surface-secondary p-1.5">
        {TAB_IDS.map((id) => {
          const Icon = TAB_ICONS[id];
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-200 ${
                active
                  ? "bg-dash-accent text-white shadow-dash-accent/30 shadow-sm"
                  : "text-dash-text-muted hover:bg-dash-surface-active hover:text-dash-text"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:block">{t(`tabs.${id}`)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels — mount lazily, stay mounted once visited */}
      <div className={activeTab === "personality" ? "block" : "hidden"}>
        {visited.current.has("personality") && (
          <PersonalityTab initialConfig={config} />
        )}
      </div>
      <div className={activeTab === "guardians" ? "block" : "hidden"}>
        {visited.current.has("guardians") && <GuardiansTab />}
      </div>
      <div className={activeTab === "knowledge" ? "block" : "hidden"}>
        {visited.current.has("knowledge") && (
          <KnowledgeTab initialConfig={config} />
        )}
      </div>
      <div className={activeTab === "properties" ? "block" : "hidden"}>
        {visited.current.has("properties") && <PropertiesTab />}
      </div>
    </div>
  );
}
