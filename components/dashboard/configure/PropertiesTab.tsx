"use client";

import {
  Building2,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { apiFetch, inputCls, type Property } from "./shared";

const EMPTY_PROP = {
  name: "",
  price: 0,
  location: "",
  rooms: 1,
  area: 0,
  status: "available" as Property["status"],
  link: "",
};

export default function PropertiesTab() {
  const t = useTranslations("dashboard.configure.properties");
  const tf = useTranslations("dashboard.configure.properties.form");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProp, setNewProp] = useState({ ...EMPTY_PROP });
  const [addingProp, setAddingProp] = useState(false);
  const [deletingPropId, setDeletingPropId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Property[]>("/api/twin-config/properties").then((res) => {
      if (res.data) setProperties(res.data);
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof typeof EMPTY_PROP>(
    field: K,
    value: (typeof EMPTY_PROP)[K],
  ) => setNewProp((prev) => ({ ...prev, [field]: value }));

  const addProperty = async () => {
    if (!newProp.name || !newProp.price || !newProp.location || addingProp)
      return;
    setAddingProp(true);
    const res = await apiFetch<Property>("/api/twin-config/properties", {
      method: "POST",
      body: JSON.stringify({ ...newProp, area: newProp.area || null }),
    });
    if (res.data) {
      setProperties((prev) => [...prev, res.data as Property]);
      setNewProp({ ...EMPTY_PROP });
      setShowAdd(false);
    }
    setAddingProp(false);
  };

  const deleteProperty = async (id: string) => {
    setDeletingPropId(id);
    await apiFetch(`/api/twin-config/properties/${id}`, { method: "DELETE" });
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setDeletingPropId(null);
  };

  const statusLabel = (status: Property["status"]) => {
    if (status === "available") return t("statusAvailable");
    if (status === "reserved") return t("statusReserved");
    return t("statusSold");
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-dash-surface-secondary"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="dash-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
          <Building2 className="h-4 w-4 text-dash-accent" />
        </div>
        <div>
          <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
            {t("title")}
          </h3>
          <p className="text-dash-text-muted text-xs">{t("subtitle")}</p>
        </div>
        <span className="ml-auto rounded-full bg-dash-accent-muted px-2.5 py-0.5 font-medium text-[11px] text-dash-accent">
          {t("countBadge", { count: properties.length })}
        </span>
      </div>

      {properties.length > 0 && (
        <div className="mb-4 space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-4 rounded-xl border border-dash-border bg-dash-bg p-4 hover:border-dash-border-strong"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-accent-muted">
                <Building2 className="h-5 w-5 text-dash-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-dash-text text-sm">
                  {p.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-dash-text-muted text-xs">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />$
                    {Number(p.price).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {p.location}
                  </span>
                  <span>
                    {t("roomsBR", { count: p.rooms })}
                    {p.area ? t("areaM2", { area: p.area }) : ""}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      p.status === "available"
                        ? "bg-dash-success-muted text-dash-success"
                        : p.status === "reserved"
                          ? "bg-dash-warning-muted text-dash-warning"
                          : "bg-dash-danger-muted text-dash-danger"
                    }`}
                  >
                    {statusLabel(p.status)}
                  </span>
                </div>
              </div>
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-dash-text-muted hover:text-dash-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => deleteProperty(p.id)}
                disabled={deletingPropId === p.id}
                className="shrink-0 text-dash-text-muted opacity-0 transition-opacity hover:text-dash-danger disabled:opacity-50 group-hover:opacity-100"
              >
                {deletingPropId === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="rounded-xl border border-dash-accent/20 bg-dash-accent-muted/30 p-5">
          <h4 className="mb-4 font-Helvetica-Neue font-semibold text-dash-text text-sm">
            {tf("title")}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-medium text-dash-text-muted text-xs">
              {tf("name")}
              <input
                type="text"
                value={newProp.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={tf("namePlaceholder")}
                className={inputCls}
              />
            </label>
            <label className="font-medium text-dash-text-muted text-xs">
              {tf("price")}
              <input
                type="number"
                value={newProp.price || ""}
                onChange={(e) => update("price", +e.target.value)}
                placeholder={tf("pricePlaceholder")}
                className={inputCls}
              />
            </label>
            <label className="font-medium text-dash-text-muted text-xs">
              {tf("location")}
              <input
                type="text"
                value={newProp.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder={tf("locationPlaceholder")}
                className={inputCls}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="font-medium text-dash-text-muted text-xs">
                {tf("rooms")}
                <input
                  type="number"
                  value={newProp.rooms}
                  onChange={(e) => update("rooms", +e.target.value)}
                  className={inputCls}
                />
              </label>
              <label className="font-medium text-dash-text-muted text-xs">
                {tf("area")}
                <input
                  type="number"
                  value={newProp.area || ""}
                  onChange={(e) => update("area", +e.target.value)}
                  className={inputCls}
                />
              </label>
            </div>
            <label className="font-medium text-dash-text-muted text-xs">
              {tf("status")}
              <select
                value={newProp.status}
                onChange={(e) =>
                  update("status", e.target.value as Property["status"])
                }
                className={inputCls}
              >
                <option value="available">{t("statusAvailable")}</option>
                <option value="reserved">{t("statusReserved")}</option>
                <option value="sold">{t("statusSold")}</option>
              </select>
            </label>
            <label className="font-medium text-dash-text-muted text-xs">
              {tf("url")}
              <input
                type="url"
                value={newProp.link}
                onChange={(e) => update("link", e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={addProperty}
              disabled={
                addingProp ||
                !newProp.name ||
                !newProp.price ||
                !newProp.location
              }
              className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover disabled:opacity-60"
            >
              {addingProp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {addingProp ? tf("submitting") : tf("submitButton")}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl px-4 py-2.5 text-dash-text-muted text-sm hover:text-dash-text"
            >
              {tf("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          disabled={properties.length >= 15}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dash-border border-dashed py-4 font-medium text-dash-text-muted text-sm hover:border-dash-accent/30 hover:bg-dash-accent-muted/20 hover:text-dash-accent disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {t("addButton", { count: properties.length })}
        </button>
      )}
    </div>
  );
}
