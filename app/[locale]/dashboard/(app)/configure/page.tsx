"use client";

import {
  Building2,
  Check,
  FlaskConical,
  Globe,
  Loader2,
  RotateCcw,
  Shield,
  Zap,
  Sparkles,
  TestTube2,
} from "lucide-react";
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

const TAB_META: Record<TabId, { labelKey: string; descriptionKey: string; icon: typeof Sparkles }> = {
  personality: { labelKey: "personality", descriptionKey: "personalityDesc", icon: Sparkles },
  guardians: { labelKey: "guardians", descriptionKey: "guardiansDesc", icon: Shield },
  knowledge: { labelKey: "knowledge", descriptionKey: "knowledgeDesc", icon: Globe },
  properties: { labelKey: "properties", descriptionKey: "propertiesDesc", icon: Building2 },
};

export default function ConfigureTwinPage() {
  const t = useTranslations("dashboard.configure");

  const [activeTab, setActiveTab] = useState<TabId>("personality");
  const [config, setConfig] = useState<TwinConfig>(DEFAULT_CONFIG);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visited = useRef<Set<TabId>>(new Set(["personality"]));

  // Test simulator
  const [testOpen, setTestOpen] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    apiFetch<TwinConfig>("/api/twin-config")
      .then((res) => {
        if (res.data) setConfig(res.data);
      })
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleTabChange = (id: TabId) => {
    visited.current.add(id);
    setActiveTab(id);
  };

  const handleTestSimulation = async () => {
    if (!testInput.trim()) return;
    setTestLoading(true);
    setTestOutput("");
    try {
      const res = await fetch("/api/twin-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testInput.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        setTestOutput(json.response ?? "No response generated.");
      } else {
        setTestOutput("Test endpoint not available. Check your configuration is saved.");
      }
    } catch {
      setTestOutput("Unable to connect to simulation service.");
    } finally {
      setTestLoading(false);
    }
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
      {/* Header */}
      <div className="dash-animate-in flex items-start justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            {t("pageTitle")}
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            {t("pageSubtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTestOpen(!testOpen)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium text-sm transition-all ${testOpen ? "bg-dash-accent text-white" : "border border-dash-border text-dash-text-secondary hover:bg-dash-surface-hover"}`}
        >
          <TestTube2 className="h-4 w-4" />
          {testOpen ? "Close Simulator" : "Test Twin"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="dash-card flex items-center justify-between rounded-2xl border border-dash-danger/20 bg-dash-danger-muted/30 p-4">
          <p className="font-medium text-dash-danger text-sm">{error}</p>
          <button
            type="button"
            onClick={() => { setError(null); setInitialLoading(true); apiFetch<TwinConfig>("/api/twin-config").then((res) => { if (res.data) setConfig(res.data); setInitialLoading(false); }).catch(() => setError("Failed to reload")).finally(() => { if (!initialLoading) setInitialLoading(false); }); }}
            className="rounded-lg bg-dash-danger px-3 py-1.5 text-white text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Test Simulator Panel */}
      {testOpen && (
        <div className="dash-card dash-animate-in overflow-hidden">
          <div className="border-dash-border border-b px-5 py-3 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-dash-accent" />
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Twin Simulator</h3>
            <span className="rounded-full bg-dash-accent-muted px-2 py-0.5 text-dash-accent text-[10px] font-medium">Preview</span>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block font-medium text-dash-text-secondary text-xs mb-1.5">Send a test message as a customer:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTestSimulation()}
                  placeholder="e.g., I'm looking for a 2-bedroom apartment in Batumi..."
                  className="flex-1 rounded-xl border border-dash-border bg-dash-bg px-4 py-2.5 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestSimulation}
                  disabled={!testInput.trim() || testLoading}
                  className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-medium text-white text-sm hover:bg-dash-accent-hover disabled:opacity-50"
                >
                  {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
            {testOutput && (
              <div className="rounded-xl bg-dash-bg border border-dash-border p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3 text-dash-accent" />
                  <span className="font-medium text-dash-text-muted text-xs">Twin Response Preview</span>
                </div>
                <p className="text-dash-text text-sm leading-relaxed">{testOutput}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="dash-animate-in flex gap-1 rounded-2xl bg-dash-surface-secondary p-1.5" style={{ animationDelay: "0.1s" }}>
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

      {/* Tab Panels */}
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
