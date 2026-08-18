"use client";

import {
  ArrowUpFromLine,
  Building2,
  Check,
  Globe,
  Home,
  Loader2,
  PenLine,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import PropertiesTab from "@/components/dashboard/configure/PropertiesTab";
import { Link } from "@/i18n/navigation";

interface Property {
  id: string;
  name: string;
  price: number | string;
  location: string;
  rooms?: number | string;
  area?: number | string;
  status?: string;
  link?: string;
  created_at?: string;
}

const STATUS_OPTIONS = ["available", "reserved", "sold"];

const PROPERTY_TYPES = ["Apartment", "House", "Land", "Office", "Warehouse"];

/**
 * MVP Properties page — manual add/list/delete with real first-party API,
 * plus a spreadsheet import for bulk uploads. No hardcoded demo data.
 */
export default function PropertiesPage() {
  const t = useTranslations("dashboard.properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "Apartment",
    price: "",
    rooms: "",
    area: "",
    status: "available",
    link: "",
  });

  function fetchProperties() {
    setLoading(true);
    setError(null);
    fetch("/api/twin-config/properties")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((j) => {
        const rows = Array.isArray(j?.data) ? j.data : [];
        setProperties(rows);
      })
      .catch(() => setError(t("errorLoad")))
      .finally(() => setLoading(false));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetch on mount only
  useState(() => {
    fetchProperties();
  });

  const filtered = properties.filter((p) => {
    const matchQuery =
      !query ||
      `${p.name} ${p.location}`.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchQuery && matchStatus;
  });

  function resetForm() {
    setForm({
      name: "",
      location: "",
      type: "Apartment",
      price: "",
      rooms: "",
      area: "",
      status: "available",
      link: "",
    });
    setFormError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.price.trim()) {
      setFormError(t("formError"));
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/twin-config/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          location: `${form.type} · ${form.location.trim()}`,
          price: Number(form.price) || 0,
          rooms: form.rooms ? Number(form.rooms) : undefined,
          area: form.area ? Number(form.area) : undefined,
          status: STATUS_OPTIONS.includes(form.status) ? form.status : "available",
          link: form.link?.trim() || undefined,
        }),
      });
      if (res.status === 409 || res.status === 400) {
        const j = await res.json().catch(() => ({}));
        setFormError(j?.error ?? t("formError"));
        return;
      }
      if (!res.ok) throw new Error();
      setSuccess(t("formSuccess"));
      setTimeout(() => setSuccess(null), 2500);
      setShowForm(false);
      resetForm();
      fetchProperties();
    } catch {
      setFormError(t("formError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/twin-config/properties/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed. Please try again.");
    }
  }

  function formatPrice(price: number | string) {
    const n = Number(price);
    if (!n) return "—";
    return n.toLocaleString();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dash-animate-in flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            {t("pageTitle")}
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            {t("pageSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 font-medium text-dash-text text-sm transition-colors hover:bg-dash-surface-hover"
          >
            <ArrowUpFromLine className="h-4 w-4 text-dash-accent" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover"
          >
            <Plus className="h-4 w-4" />
            {t("addProperty")}
          </button>
        </div>
      </div>

      {success && (
        <div className="dash-animate-in flex items-center gap-2 rounded-xl border border-dash-success/20 bg-dash-success-muted/40 px-4 py-2.5">
          <Check className="h-4 w-4 text-dash-success" />
          <span className="text-dash-success text-sm">{success}</span>
        </div>
      )}

      {/* Add property form */}
      {showForm && (
        <div className="dash-animate-in dash-card p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formName")} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("formNamePlaceholder")}
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formLocation")} *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder={t("formLocationPlaceholder")}
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formType")}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formPrice")} *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder={t("formPricePlaceholder")}
                  min="0"
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formRooms")}
                </label>
                <input
                  type="number"
                  value={form.rooms}
                  onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                  min="0"
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formArea")}
                </label>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="m²"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  {t("formStatus")}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                >
                  <option value="available">{t("statusAvailable")}</option>
                  <option value="reserved">{t("statusReserved")}</option>
                  <option value="sold">{t("statusSold")}</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  Link (optional)
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-dash-border bg-white px-3.5 py-2.5 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
                />
              </div>
            </div>
            {formError && (
              <p className="text-dash-danger text-sm">{formError}</p>
            )}
            <div className="flex items-center justify-end gap-2 border-dash-border border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2.5 text-dash-text-secondary text-sm transition-colors hover:bg-dash-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("formSaving")}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("formSave")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk import (collapsible) */}
      {showImport && (
        <div className="dash-animate-in dash-card p-5">
          <PropertiesTab />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-dash-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-dash-border bg-white py-2.5 pr-3.5 pl-10 text-dash-text text-sm placeholder-dash-text-muted/40 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-dash-text-muted hover:text-dash-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-dash-border bg-white p-1">
          {["all", "available", "reserved", "sold"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${
                statusFilter === s
                  ? "bg-dash-accent text-white"
                  : "text-dash-text-muted hover:bg-dash-surface-hover"
              }`}
            >
              {s === "all" ? t("all") : t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content states */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="dash-card h-44 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dash-danger/20 bg-dash-danger-muted/30 px-6 py-10 text-center">
          <ShieldAlert className="h-6 w-6 text-dash-danger" />
          <p className="text-dash-danger text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchProperties}
            className="rounded-xl bg-dash-accent px-4 py-2 text-sm font-semibold text-white hover:bg-dash-accent-hover"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dash-border bg-white px-6 py-12 text-center">
          <Home className="h-8 w-8 text-dash-text-muted" />
          {query || statusFilter !== "all" ? (
            <p className="text-dash-text-muted text-sm">
              {t("noProperty")} — try a different search or filter.
            </p>
          ) : (
            <>
              <p className="text-dash-text-secondary text-sm">
                {t("empty")}
              </p>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover"
              >
                <Plus className="h-4 w-4" />
                {t("addProperty")}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="dash-card dash-animate-in group flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent-muted">
                  <Building2 className="h-5 w-5 text-dash-accent" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-medium text-[11px] ${
                    p.status === "sold"
                      ? "bg-dash-danger-muted text-dash-danger"
                      : p.status === "reserved"
                        ? "bg-dash-warning-muted text-dash-warning"
                        : "bg-dash-success-muted text-dash-success"
                  }`}
                >
                  {p.status === "sold"
                    ? t("statusSold")
                    : p.status === "reserved"
                      ? t("statusReserved")
                      : t("statusAvailable")}
                </span>
              </div>
              <div className="mt-3 flex-1">
                <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                  {p.name}
                </h3>
                <p className="mt-0.5 text-dash-text-muted text-xs">
                  {p.location || "No location"}
                </p>
                <div className="mt-2 flex items-center gap-4 text-dash-text-secondary text-xs">
                  <span className="font-semibold text-dash-text text-sm">
                    {formatPrice(p.price)} GEL
                  </span>
                  {p.rooms ? (
                    <span className="flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      {p.rooms} rooms
                    </span>
                  ) : null}
                  {p.area ? <span>{p.area} m²</span> : null}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-dash-border border-t pt-3">
                {p.link ? (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-dash-accent text-xs font-medium no-underline hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Listing
                  </a>
                ) : (
                  <span className="text-dash-text-muted text-xs">No link</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: p.name,
                        location: p.location,
                        type: PROPERTY_TYPES.includes(p.location.split(" · ")[0])
                          ? p.location.split(" · ")[0]
                          : "Apartment",
                        price: String(p.price ?? ""),
                        rooms: String(p.rooms ?? ""),
                        area: String(p.area ?? ""),
                        status: STATUS_OPTIONS.includes(p.status ?? "")
                          ? (p.status ?? "available")
                          : "available",
                        link: p.link ?? "",
                      });
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-dash-text-muted text-xs transition-colors hover:bg-dash-surface-hover hover:text-dash-text"
                    aria-label="Edit property"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-dash-text-muted text-xs transition-colors hover:bg-dash-danger-muted hover:text-dash-danger"
                    aria-label="Delete property"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
