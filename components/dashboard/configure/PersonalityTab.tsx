"use client";

import { Check, MessageSquare, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  SaveButton,
  TONE_IDS,
  apiFetch,
  inputCls,
  type TwinConfig,
} from "./shared";

interface Props {
  initialConfig: TwinConfig;
}

export default function PersonalityTab({ initialConfig }: Props) {
  const t = useTranslations("dashboard.configure");
  const ti = useTranslations("dashboard.configure.personality.identity");
  const tt = useTranslations("dashboard.configure.personality.tone");

  const [twinName, setTwinName] = useState(initialConfig.twin_name);
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialConfig.welcome_message,
  );
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [selectedTone, setSelectedTone] = useState(initialConfig.tone);
  const [savingTone, setSavingTone] = useState(false);

  const saveIdentity = async () => {
    setSavingIdentity(true);
    await Promise.all([
      apiFetch("/api/twin-config", {
        method: "PUT",
        body: JSON.stringify({
          twin_name: twinName,
          welcome_message: welcomeMessage,
        }),
      }),
      apiFetch("/api/dashboard/configure/personality", {
        method: "POST",
        body: JSON.stringify({
          agent_name: twinName,
          greeting_message: welcomeMessage,
        }),
      }),
    ]);
    setSavingIdentity(false);
  };

  const saveTone = async () => {
    setSavingTone(true);
    await Promise.all([
      apiFetch("/api/twin-config", {
        method: "PUT",
        body: JSON.stringify({ tone: selectedTone }),
      }),
      apiFetch("/api/dashboard/configure/tone", {
        method: "POST",
        body: JSON.stringify({ tone: selectedTone }),
      }),
    ]);
    setSavingTone(false);
  };

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="dash-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
            <User className="h-4 w-4 text-dash-accent" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              {ti("title")}
            </h3>
            <p className="text-dash-text-muted text-xs">{ti("subtitle")}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              {ti("twinNameLabel")}
              <input
                type="text"
                value={twinName}
                onChange={(e) => setTwinName(e.target.value)}
                placeholder={ti("twinNamePlaceholder")}
                className={inputCls}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              {ti("welcomeMessageLabel")}
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </label>
            <p className="text-dash-text-muted text-xs">
              {ti("welcomeMessageHint")}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton
            saving={savingIdentity}
            onClick={saveIdentity}
            label={ti("saveButton")}
            savingLabel={t("saving")}
          />
        </div>
      </div>

      {/* Tone */}
      <div className="dash-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
            <MessageSquare className="h-4 w-4 text-dash-accent" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              {tt("title")}
            </h3>
            <p className="text-dash-text-muted text-xs">{tt("subtitle")}</p>
          </div>
          <span className="ml-auto rounded-full bg-dash-accent-muted px-2.5 py-0.5 font-medium text-[11px] text-dash-accent">
            {tt(`options.${selectedTone}.label`)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TONE_IDS.map(({ id, emoji }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedTone(id)}
              className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                selectedTone === id
                  ? "border-dash-accent/40 bg-dash-accent-muted shadow-dash-accent/10 shadow-md"
                  : "border-dash-border bg-dash-bg hover:border-dash-border-strong"
              }`}
            >
              {selectedTone === id && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-dash-accent">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-2xl">{emoji}</span>
              <span className="mt-2 font-semibold text-dash-text text-sm">
                {tt(`options.${id}.label`)}
              </span>
              <span className="text-dash-text-muted text-xs">
                {tt(`options.${id}.desc`)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-dash-border bg-dash-bg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-dash-accent" />
            <span className="font-medium text-dash-text-secondary text-xs">
              {tt("preview")}
            </span>
          </div>
          <p className="text-dash-text text-sm leading-relaxed">
            {tt(`options.${selectedTone}.sample`)}
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton
            saving={savingTone}
            onClick={saveTone}
            label={tt("saveButton")}
            savingLabel={t("saving")}
          />
        </div>
      </div>
    </div>
  );
}
