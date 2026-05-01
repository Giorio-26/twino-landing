"use client";

import { Loader2, Save } from "lucide-react";

export interface TwinConfig {
  twin_name: string;
  welcome_message: string;
  tone: string;
  agency_name: string;
  agency_address: string;
  agency_working_hours: string;
  agency_phone: string;
  agency_website: string;
  agency_additional_info: string;
}

export interface Rule {
  id: string;
  rule_text: string;
  sort_order: number;
}

export interface Property {
  id: string;
  name: string;
  price: number;
  location: string;
  rooms: number;
  area: number | null;
  status: "available" | "reserved" | "sold";
  link: string;
}

export const TONE_IDS = [
  { id: "professional", emoji: "🏢" },
  { id: "friendly", emoji: "😊" },
  { id: "direct", emoji: "📋" },
  { id: "luxury", emoji: "💎" },
  { id: "consultative", emoji: "🤝" },
] as const;

export type ToneId = (typeof TONE_IDS)[number]["id"];

export const DEFAULT_CONFIG: TwinConfig = {
  twin_name: "Ana",
  welcome_message:
    "Hello! I'm {name}, your real estate assistant. How can I help you today?",
  tone: "friendly",
  agency_name: "",
  agency_address: "",
  agency_working_hours: "Mon-Fri 9:00-18:00, Sat 10:00-15:00",
  agency_phone: "",
  agency_website: "",
  agency_additional_info: "",
};

export const inputCls =
  "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (res.status === 204) return {};
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Request failed" };
    return { data: json.data };
  } catch {
    return { error: "Network error" };
  }
}

export function SaveButton({
  saving,
  onClick,
  label = "Save",
  savingLabel = "Saving\u2026",
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
  savingLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2 font-semibold text-sm text-white transition-all hover:bg-dash-accent-hover hover:shadow-dash-accent/20 hover:shadow-md disabled:opacity-60"
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {saving ? savingLabel : label}
    </button>
  );
}
