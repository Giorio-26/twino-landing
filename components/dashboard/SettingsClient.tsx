"use client";

import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  Loader2,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

type CompanyData = {
  name: string;
  email: string;
  phone: string;
  website: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsClient({
  initialCompany,
}: {
  initialCompany: CompanyData | null;
}) {
  const [agency, setAgency] = useState<CompanyData>({
    name: initialCompany?.name ?? "",
    email: initialCompany?.email ?? "",
    phone: initialCompany?.phone ?? "",
    website: initialCompany?.website ?? "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notifications, setNotifications] = useState({
    email: true,
    telegram: true,
    takeover: true,
  });

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/dashboard/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agency),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Settings
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Manage your account and preferences.
        </p>
      </div>

      {/* Agency Profile */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="flex items-center gap-4 border-dash-border border-b p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
            <Building2 className="h-5 w-5 text-dash-accent" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              Agency Profile
            </h3>
            <p className="text-dash-text-muted text-xs">
              Your agency&apos;s basic information
            </p>
          </div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Agency Name
              <input
                type="text"
                value={agency.name}
                onChange={(e) => setAgency({ ...agency, name: e.target.value })}
                placeholder="Sakura Properties"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Email
              <input
                type="email"
                value={agency.email}
                onChange={(e) =>
                  setAgency({ ...agency, email: e.target.value })
                }
                placeholder="info@sakura.ge"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Phone
              <input
                type="tel"
                value={agency.phone}
                onChange={(e) =>
                  setAgency({ ...agency, phone: e.target.value })
                }
                placeholder="+995 555 123 456"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Website
              <input
                type="url"
                value={agency.website}
                onChange={(e) =>
                  setAgency({ ...agency, website: e.target.value })
                }
                placeholder="https://sakura.ge"
                className={inputCls}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-dash-border border-t px-6 py-4">
          {saveState === "error" && (
            <p className="text-dash-danger text-xs">Failed to save. Try again.</p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-60"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saveState === "saved" ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-4 border-dash-border border-b p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-warning-muted">
            <Bell className="h-5 w-5 text-dash-warning" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              Notifications
            </h3>
            <p className="text-dash-text-muted text-xs">
              Choose what you want to be notified about
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {[
            {
              key: "email",
              label: "Email notifications",
              desc: "Receive daily lead summaries via email",
            },
            {
              key: "telegram",
              label: "Telegram alerts",
              desc: "Get instant alerts for urgent events",
            },
            {
              key: "takeover",
              label: "Agent takeover alerts",
              desc: "Get notified when AI requests human intervention",
            },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between rounded-xl border border-dash-border p-4"
            >
              <div>
                <div className="font-medium text-dash-text text-sm">
                  {n.label}
                </div>
                <div className="text-dash-text-muted text-xs">{n.desc}</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [n.key]:
                      !notifications[n.key as keyof typeof notifications],
                  })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? "bg-dash-accent" : "bg-dash-surface-secondary"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members (Placeholder) */}
      <div
        className="dash-card dash-animate-in p-6 opacity-60"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
              <Users className="h-5 w-5 text-dash-purple" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                Team Members
              </h3>
              <p className="text-dash-text-muted text-xs">
                Invite agents to your TwinO workspace.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-dash-purple-muted px-3 py-1 font-semibold text-dash-purple text-xs">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="dash-animate-in overflow-hidden rounded-2xl border border-dash-danger/20"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4 border-dash-danger/10 border-b bg-dash-danger-muted/30 p-6">
          <AlertTriangle className="h-5 w-5 text-dash-danger" />
          <h3 className="font-Helvetica-Neue font-semibold text-dash-danger text-sm">
            Danger Zone
          </h3>
        </div>
        <div className="bg-dash-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-dash-text text-sm">
                Delete Account
              </div>
              <div className="text-dash-text-muted text-xs">
                Permanently delete your agency and all data.
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-dash-danger/30 px-4 py-2 font-medium text-dash-danger text-sm transition-colors hover:bg-dash-danger-muted"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
