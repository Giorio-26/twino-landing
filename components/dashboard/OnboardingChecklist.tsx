"use client";

import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export interface OnboardingStep {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "profile",
    label: "onboarding.profile",
    href: "/dashboard/settings",
    icon: PenLine,
  },
  {
    id: "twin",
    label: "onboarding.configureTwin",
    href: "/dashboard/configure",
    icon: Sparkles,
  },
  {
    id: "property",
    label: "onboarding.addProperty",
    href: "/dashboard/properties",
    icon: Building2,
  },
  {
    id: "whatsapp",
    label: "onboarding.connectWhatsApp",
    href: "/dashboard/integration",
    icon: MessageSquare,
  },
  {
    id: "test",
    label: "onboarding.testTwin",
    href: "/dashboard/configure",
    icon: FlaskConical,
  },
  {
    id: "leads",
    label: "onboarding.firstLead",
    href: "/dashboard/leads",
    icon: LayoutDashboard,
  },
];

type StepStates = Record<string, boolean>;

export default function OnboardingChecklist({
  onDismissed,
}: {
  onDismissed?: () => void;
}) {
  const t = useTranslations("dashboard.onboarding");

  const [stepsDone, setStepsDone] = useState<StepStates>({});
  const [checking, setChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function derive() {
      const states: StepStates = {};

      // 1. Company profile (name + phone set)
      try {
        const r = await fetch("/api/dashboard/company");
        if (r.ok) {
          const j = await r.json();
          const c = j?.data ?? {};
          states.profile = !!(c.name && c.phone);
        } else {
          states.profile = false;
        }
      } catch {
        states.profile = false;
      }

      // 2. Twin configured (name + tone set)
      try {
        const r = await fetch("/api/twin-config");
        if (r.ok) {
          const j = await r.json();
          const c = j?.data ?? {};
          states.twin = !!(c.twin_name && c.welcome_message && c.tone);
        } else {
          states.twin = false;
        }
      } catch {
        states.twin = false;
      }

      // 3. At least one property (first-party store)
      try {
        const r = await fetch("/api/twin-config/properties");
        if (r.ok) {
          const j = await r.json();
          const props = Array.isArray(j?.data) ? j.data : [];
          states.property = props.length > 0;
        } else {
          states.property = false;
        }
      } catch {
        states.property = false;
      }

      // 4. WhatsApp connected
      try {
        const r = await fetch("/api/dashboard/whatsapp/status");
        if (r.ok) {
          const j = await r.json();
          states.whatsapp = !!j.connected;
        } else {
          states.whatsapp = false;
        }
      } catch {
        states.whatsapp = false;
      }

      // 5. Twin tested — approximate via at least one rule present
      try {
        const r = await fetch("/api/twin-config/rules");
        if (r.ok) {
          const j = await r.json();
          const rules = Array.isArray(j?.data) ? j.data : [];
          states.test = rules.length > 0;
        } else {
          states.test = false;
        }
      } catch {
        states.test = false;
      }

      // 6. First lead received
      try {
        const r = await fetch("/api/dashboard/leads");
        if (r.ok) {
          const j = await r.json();
          const leads = Array.isArray(j?.data) ? j.data : [];
          states.leads = leads.length > 0;
        } else {
          states.leads = false;
        }
      } catch {
        states.leads = false;
      }

      if (!cancelled) {
        setStepsDone(states);
        setChecking(false);
      }
    }

    void derive();
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed) return null;

  const total = ONBOARDING_STEPS.length;
  const done = ONBOARDING_STEPS.filter((s) => stepsDone[s.id]).length;
  const progress = checking ? 0 : Math.round((done / total) * 100);
  const allDone = done === total && !checking;

  return (
    <div className="dash-card dash-animate-in p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
            {t("title")}
          </h3>
          <p className="mt-0.5 text-dash-text-muted text-xs">
            {t("progress", { done, total, progress })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismissed?.();
          }}
          aria-label="Dismiss onboarding checklist"
          className="shrink-0 rounded-lg p-1 text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-dash-surface-secondary">
        <div
          className="h-full rounded-full bg-dash-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="mt-4 space-y-1.5">
        {ONBOARDING_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = stepsDone[step.id] ?? false;
          return (
            <a
              key={step.id}
              href={step.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-dash-surface-hover"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isDone
                    ? "bg-dash-success-muted"
                    : "bg-dash-surface-secondary"
                }`}
              >
                {checking ? (
                  <Loader2 className="h-3 w-3 animate-spin text-dash-text-muted" />
                ) : isDone ? (
                  <Check className="h-3.5 w-3.5 text-dash-success" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-dash-text-muted" />
                )}
              </span>
              <span
                className={`flex-1 text-sm ${isDone ? "text-dash-text-muted line-through" : "text-dash-text"}`}
              >
                {t(step.label)}
              </span>
              {isDone && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-dash-success" />
              )}
              {!isDone && (
                <ChevronRight className="h-4 w-4 shrink-0 text-dash-text-muted" />
              )}
            </a>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-dash-success-muted px-3 py-2">
          <Check className="h-4 w-4 text-dash-success" />
          <span className="font-medium text-dash-success text-xs">
            {t("complete")}
          </span>
        </div>
      )}
    </div>
  );
}
