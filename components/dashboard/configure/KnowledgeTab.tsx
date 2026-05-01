"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { apiFetch, inputCls, SaveButton, type TwinConfig } from "./shared";

// ─── Working Hours ─────────────────────────────────────────────────────────────

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAY_ORDER)[number];

type DayHours = { enabled: boolean; from: string; to: string };
type WorkingHoursState = Record<Day, DayHours>;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const DEFAULT_DAY: DayHours = { enabled: false, from: "09:00", to: "18:00" };

function parseWorkingHours(str: string): WorkingHoursState {
  const state = Object.fromEntries(
    DAY_ORDER.map((d) => [d, { ...DEFAULT_DAY }]),
  ) as WorkingHoursState;

  for (const seg of str.split(/,\s*/)) {
    const m = seg.match(
      /^([A-Za-z]+)(?:-([A-Za-z]+))?\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/,
    );
    if (!m) continue;
    const [, startDay, endDay, rawFrom, rawTo] = m;
    const pad = (t: string) => (t.length === 4 ? `0${t}` : t);
    const from = pad(rawFrom);
    const to = pad(rawTo);

    const si = DAY_ORDER.indexOf(startDay as Day);
    const ei = endDay ? DAY_ORDER.indexOf(endDay as Day) : si;
    if (si < 0) continue;
    for (let i = si; i <= Math.max(si, ei); i++) {
      state[DAY_ORDER[i]] = { enabled: true, from, to };
    }
  }

  return state;
}

function formatWorkingHours(hours: WorkingHoursState): string {
  const result: string[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    if (!hours[day].enabled) {
      i++;
      continue;
    }
    let j = i;
    while (
      j + 1 < DAY_ORDER.length &&
      hours[DAY_ORDER[j + 1]].enabled &&
      hours[DAY_ORDER[j + 1]].from === hours[day].from &&
      hours[DAY_ORDER[j + 1]].to === hours[day].to
    )
      j++;
    const label = j > i ? `${DAY_ORDER[i]}-${DAY_ORDER[j]}` : DAY_ORDER[i];
    result.push(`${label} ${hours[day].from}-${hours[day].to}`);
    i = j + 1;
  }
  return result.join(", ");
}

// ─── WorkingHoursPicker ────────────────────────────────────────────────────────

const DAYS_CONFIG = [
  { key: "Mon" as Day, label: "Monday" },
  { key: "Tue" as Day, label: "Tuesday" },
  { key: "Wed" as Day, label: "Wednesday" },
  { key: "Thu" as Day, label: "Thursday" },
  { key: "Fri" as Day, label: "Friday" },
  { key: "Sat" as Day, label: "Saturday" },
  { key: "Sun" as Day, label: "Sunday" },
] as const;

const timeSel =
  "rounded-lg border border-dash-border bg-dash-bg px-2.5 py-1 text-sm text-dash-text focus:border-dash-accent/40 focus:outline-none focus:ring-1 focus:ring-dash-accent/20";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 ${
        enabled ? "bg-dash-accent" : "bg-dash-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function WorkingHoursPicker({
  value,
  onChange,
}: {
  value: WorkingHoursState;
  onChange: (v: WorkingHoursState) => void;
}) {
  const tk = useTranslations("dashboard.configure.knowledge");

  const toggleDay = (day: Day) =>
    onChange({ ...value, [day]: { ...value[day], enabled: !value[day].enabled } });

  const setTime = (day: Day, field: "from" | "to", time: string) =>
    onChange({ ...value, [day]: { ...value[day], [field]: time } });

  return (
    <div className="divide-y divide-dash-border overflow-hidden rounded-xl border border-dash-border">
      {DAYS_CONFIG.map(({ key, label }, idx) => {
        const h = value[key];
        const isWeekend = idx >= 5;
        return (
          <div
            key={key}
            className={`flex items-center gap-4 px-4 py-3 transition-colors ${
              isWeekend ? "bg-dash-surface-secondary/30" : ""
            }`}
          >
            <Toggle enabled={h.enabled} onToggle={() => toggleDay(key)} />
            <span
              className={`w-24 text-sm font-medium transition-colors select-none ${
                h.enabled ? "text-dash-text" : "text-dash-text-muted"
              }`}
            >
              {label}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {h.enabled ? (
                <>
                  <select
                    value={h.from}
                    onChange={(e) => setTime(key, "from", e.target.value)}
                    className={timeSel}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-dash-text-muted text-xs">—</span>
                  <select
                    value={h.to}
                    onChange={(e) => setTime(key, "to", e.target.value)}
                    className={timeSel}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </>
              ) : (
                <span className="text-dash-text-muted text-sm">{tk("closed")}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── KnowledgeTab ─────────────────────────────────────────────────────────────

interface Props {
  initialConfig: TwinConfig;
}

export default function KnowledgeTab({ initialConfig }: Props) {
  const t = useTranslations("dashboard.configure");
  const tk = useTranslations("dashboard.configure.knowledge");

  const [agencyInfo, setAgencyInfo] = useState({
    address: initialConfig.agency_address,
    workingHours: parseWorkingHours(initialConfig.agency_working_hours),
    website: initialConfig.agency_website,
    additionalInfo: initialConfig.agency_additional_info ?? "",
  });
  const [saving, setSaving] = useState(false);

  const update =
    (field: "address" | "website" | "additionalInfo") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAgencyInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const working_hours = formatWorkingHours(agencyInfo.workingHours);
    await Promise.all([
      apiFetch("/api/twin-config", {
        method: "PUT",
        body: JSON.stringify({
          agency_address: agencyInfo.address,
          agency_working_hours: working_hours,
          agency_website: agencyInfo.website,
          agency_additional_info: agencyInfo.additionalInfo,
        }),
      }),
      apiFetch("/api/dashboard/configure/base", {
        method: "POST",
        body: JSON.stringify({
          address: agencyInfo.address,
          working_hours,
          website: agencyInfo.website,
          additional_info: agencyInfo.additionalInfo,
        }),
      }),
    ]);
    setSaving(false);
  };

  return (
    <div className="dash-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
          <Globe className="h-4 w-4 text-dash-accent" />
        </div>
        <div>
          <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
            {tk("title")}
          </h3>
          <p className="text-dash-text-muted text-xs">{tk("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Address */}
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("address")}
          <input
            type="text"
            value={agencyInfo.address}
            onChange={update("address")}
            placeholder={tk("addressPlaceholder")}
            className={`${inputCls} mt-1.5`}
          />
        </label>

        {/* Website */}
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("website")}
          <input
            type="url"
            value={agencyInfo.website}
            onChange={update("website")}
            placeholder={tk("websitePlaceholder")}
            className={`${inputCls} mt-1.5`}
          />
        </label>

        {/* Working Hours Picker */}
        <div className="sm:col-span-2">
          <p className="mb-2 font-medium text-dash-text-secondary text-sm">
            {tk("workingHours")}
          </p>
          <div className="rounded-xl border border-dash-border bg-dash-bg p-4">
            <WorkingHoursPicker
              value={agencyInfo.workingHours}
              onChange={(v) =>
                setAgencyInfo((prev) => ({ ...prev, workingHours: v }))
              }
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="sm:col-span-2">
          <label className="block font-medium text-dash-text-secondary text-sm">
            {tk("additionalInfo")}
            <textarea
              value={agencyInfo.additionalInfo}
              onChange={update("additionalInfo")}
              placeholder={tk("additionalInfoPlaceholder")}
              rows={4}
              className={`${inputCls} mt-1.5 resize-none`}
            />
          </label>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <SaveButton
          saving={saving}
          onClick={save}
          label={tk("saveButton")}
          savingLabel={t("saving")}
        />
      </div>
    </div>
  );
}
