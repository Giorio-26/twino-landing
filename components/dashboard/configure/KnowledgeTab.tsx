"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { apiFetch, inputCls, SaveButton, type TwinConfig } from "./shared";

interface Props {
  initialConfig: TwinConfig;
}

export default function KnowledgeTab({ initialConfig }: Props) {
  const t = useTranslations("dashboard.configure");
  const tk = useTranslations("dashboard.configure.knowledge");

  const [agencyInfo, setAgencyInfo] = useState({
    name: initialConfig.agency_name,
    address: initialConfig.agency_address,
    workingHours: initialConfig.agency_working_hours,
    phone: initialConfig.agency_phone,
    website: initialConfig.agency_website,
  });
  const [saving, setSaving] = useState(false);

  const update =
    (field: keyof typeof agencyInfo) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAgencyInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await Promise.all([
      apiFetch("/api/twin-config", {
        method: "PUT",
        body: JSON.stringify({
          agency_name: agencyInfo.name,
          agency_address: agencyInfo.address,
          agency_working_hours: agencyInfo.workingHours,
          agency_phone: agencyInfo.phone,
          agency_website: agencyInfo.website,
        }),
      }),
      apiFetch("/api/dashboard/configure/base", {
        method: "POST",
        body: JSON.stringify({
          agency_name: agencyInfo.name,
          phone: agencyInfo.phone,
          address: agencyInfo.address,
          working_hours: agencyInfo.workingHours,
          website: agencyInfo.website,
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
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("agencyName")}
          <input
            type="text"
            value={agencyInfo.name}
            onChange={update("name")}
            placeholder={tk("agencyNamePlaceholder")}
            className={inputCls}
          />
        </label>
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("phone")}
          <input
            type="tel"
            value={agencyInfo.phone}
            onChange={update("phone")}
            placeholder={tk("phonePlaceholder")}
            className={inputCls}
          />
        </label>
        <label className="block font-medium text-dash-text-secondary text-sm sm:col-span-2">
          {tk("address")}
          <input
            type="text"
            value={agencyInfo.address}
            onChange={update("address")}
            placeholder={tk("addressPlaceholder")}
            className={inputCls}
          />
        </label>
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("workingHours")}
          <input
            type="text"
            value={agencyInfo.workingHours}
            onChange={update("workingHours")}
            className={inputCls}
          />
        </label>
        <label className="block font-medium text-dash-text-secondary text-sm">
          {tk("website")}
          <input
            type="url"
            value={agencyInfo.website}
            onChange={update("website")}
            placeholder={tk("websitePlaceholder")}
            className={inputCls}
          />
        </label>
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
