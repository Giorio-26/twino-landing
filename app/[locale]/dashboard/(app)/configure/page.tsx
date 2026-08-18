"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FlaskConical,
  Globe,
  Loader2,
  Shield,
  Sparkles,
  TestTube2,
  User,
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

const STEPS = [
  { id: "identity", icon: User, body: "personality" },
  { id: "personality", icon: Sparkles, body: "personality" },
  { id: "instructions", icon: Shield, body: "instructions" },
  { id: "knowledge", icon: Globe, body: "knowledge" },
  { id: "properties", icon: Building2, body: "properties" },
  { id: "test", icon: TestTube2, body: "test" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function ConfigureTwinPage() {
  const t = useTranslations("dashboard.configure");
  const tw = useTranslations("dashboard.configure.wizard");

  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<TwinConfig>(DEFAULT_CONFIG);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepSaved, setStepSaved] = useState<Record<string, boolean>>({});

  // Test simulator
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<TwinConfig>("/api/twin-config")
      .then((res) => {
        if (res.data) setConfig(res.data);
      })
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setInitialLoading(false));
  }, []);

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
        setTestOutput(tw("testUnavailable"));
      }
    } catch {
      setTestOutput(tw("testUnavailable"));
    } finally {
      setTestLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-dash-surface-secondary" />
        <div className="h-12 animate-pulse rounded-2xl bg-dash-surface-secondary" />
        <div className="h-64 animate-pulse rounded-2xl bg-dash-surface-secondary" />
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          {t("pageTitle")}
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          {t("pageSubtitle")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="dash-card flex items-center justify-between rounded-2xl border border-dash-danger/20 bg-dash-danger-muted/30 p-4">
          <p className="font-medium text-dash-danger text-sm">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setInitialLoading(true);
              apiFetch<TwinConfig>("/api/twin-config")
                .then((res) => {
                  if (res.data) setConfig(res.data);
                  setInitialLoading(false);
                })
                .catch(() => setError("Failed to reload"));
            }}
            className="rounded-lg bg-dash-danger px-3 py-1.5 text-white text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stepper */}
      <div className="dash-card dash-animate-in p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    active
                      ? "border-dash-accent bg-dash-accent text-white"
                      : done
                        ? "border-dash-accent bg-dash-accent-muted text-dash-accent"
                        : "border-dash-border bg-dash-bg text-dash-text-muted"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1.5 h-0.5 w-6 sm:w-10 ${
                      i < step ? "bg-dash-accent/50" : "bg-dash-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-medium text-dash-text-secondary text-xs">
          {tw("step", { n: step + 1 })}{" "}
          <span className="font-semibold text-dash-text">
            {tw(`step${step + 1}Title`)}
          </span>
        </p>
      </div>

      {/* Step body */}
      <div className="dash-animate-in" key={step} style={{ animationDuration: "0.3s" }}>
        <p className="mb-4 text-dash-text-muted text-sm">
          {tw(`step${step + 1}Desc`)}
        </p>

        {step === 0 && (
          <PersonalityTab
            initialConfig={config}
            focus="identity"
            onSaved={() => setStepSaved((p) => ({ ...p, identity: true }))}
          />
        )}
        {step === 1 && (
          <PersonalityTab
            initialConfig={config}
            focus="tone"
            onSaved={() => setStepSaved((p) => ({ ...p, personality: true }))}
          />
        )}
        {step === 2 && (
          <GuardiansTab
            title={tw("step3Title")}
            subtitle={tw("step3Desc")}
            onSaved={() => setStepSaved((p) => ({ ...p, instructions: true }))}
          />
        )}
        {step === 3 && (
          <KnowledgeTab
            initialConfig={config}
            onSaved={() => setStepSaved((p) => ({ ...p, knowledge: true }))}
          />
        )}
        {step === 4 && (
          <PropertiesTab
            onSaved={() => setStepSaved((p) => ({ ...p, properties: true }))}
          />
        )}
        {step === 5 && (
          <div className="dash-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
                <FlaskConical className="h-4 w-4 text-dash-accent" />
              </div>
              <div>
                <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                  {tw("testTwin")}
                </h3>
                <p className="text-dash-text-muted text-xs">
                  {tw("step6Desc")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestSimulation()}
                placeholder={tw("testPlaceholder")}
                className="w-full rounded-xl border border-dash-border bg-dash-bg px-4 py-3 text-dash-text text-sm placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
              />
              <button
                type="button"
                onClick={handleTestSimulation}
                disabled={!testInput.trim() || testLoading}
                className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-50"
              >
                {testLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {tw("testTwin")}
              </button>
              {testOutput && (
                <div className="rounded-xl border border-dash-border bg-dash-bg p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-dash-accent" />
                    <span className="font-medium text-dash-text-muted text-xs">
                      Twin Response Preview
                    </span>
                  </div>
                  <p className="text-dash-text text-sm leading-relaxed">
                    {testOutput}
                  </p>
                </div>
              )}
              {!testOutput && !testLoading && (
                <p className="text-dash-text-muted text-xs">
                  {tw("testAwaiting")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="dash-animate-in flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-xl border border-dash-border px-4 py-2.5 font-medium text-dash-text-secondary text-sm transition-colors hover:bg-dash-surface-hover disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
          {tw("back")}
        </button>

        <div className="flex items-center gap-3">
          {stepSaved[STEPS[step].id] && (
            <span className="flex items-center gap-1.5 text-dash-success text-xs font-medium">
              <Check className="h-3.5 w-3.5" />
              {tw("saved")}
            </span>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover"
            >
              {tw("next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 rounded-xl bg-dash-success px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-success-hover"
            >
              <Check className="h-4 w-4" />
              {tw("finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
