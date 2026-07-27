"use client";

import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
  X,
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "agent";
  avatar?: string;
  joinedAt: string;
}

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

  // Team state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "agent">("agent");
  const [inviting, setInviting] = useState(false);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: agency.name || "You",
      email: agency.email || "you@twino.estate",
      role: "owner",
      joinedAt: "2024-01-01",
    },
  ]);

  // Danger zone confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

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

  async function handleInvite() {
    setInviting(true);
    try {
      const res = await fetch("/api/dashboard/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error();
      setShowInvite(false);
      setInviteEmail("");
    } catch {
      // silent
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Settings
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Manage your account, team, and preferences.
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
                placeholder="TwinO"
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
                placeholder="info@twino.estate"
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
                placeholder="https://twino.estate"
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

      {/* Team Members */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center justify-between border-dash-border border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
              <Users className="h-5 w-5 text-dash-purple" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                Team Members
              </h3>
              <p className="text-dash-text-muted text-xs">
                {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} · Manage access to your workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 rounded-xl bg-dash-accent px-3 py-1.5 font-medium text-white text-xs hover:bg-dash-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Invite
          </button>
        </div>

        {/* Invite panel */}
        {showInvite && (
          <div className="border-dash-border border-b bg-dash-surface-secondary p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block font-medium text-dash-text-secondary text-xs mb-1">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="agent@company.com"
                    className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-dash-text-secondary text-xs mb-1">Role</label>
                  <div className="flex gap-2">
                    {(["admin", "agent"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setInviteRole(r)}
                        className={`rounded-lg px-3 py-1.5 font-medium text-xs capitalize ${inviteRole === r ? "bg-dash-accent-muted text-dash-accent" : "bg-dash-surface text-dash-text-muted hover:bg-dash-surface-hover"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowInvite(false)} className="p-1 text-dash-text-muted hover:text-dash-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="mt-3 flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 font-medium text-white text-sm hover:bg-dash-accent-hover disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Send Invite
            </button>
          </div>
        )}

        {/* Members list */}
        <div className="divide-dash-border divide-y">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-accent/10 font-semibold text-dash-accent text-sm">
                  {member.name[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-medium text-dash-text text-sm">{member.name}</div>
                  <div className="text-dash-text-muted text-xs">{member.email}</div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 font-medium text-[11px] capitalize ${
                member.role === "owner" ? "bg-dash-accent-muted text-dash-accent" :
                member.role === "admin" ? "bg-dash-purple-muted text-dash-purple" :
                "bg-dash-surface-secondary text-dash-text-muted"
              }`}>
                {member.role}
              </span>
            </div>
          ))}
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
              icon: Mail,
            },
            {
              key: "takeover",
              label: "Agent takeover alerts",
              desc: "Get notified when AI requests human intervention",
              icon: Shield,
            },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between rounded-xl border border-dash-border p-4"
            >
              <div className="flex items-center gap-3">
                <n.icon className="h-4 w-4 text-dash-text-muted" />
                <div>
                  <div className="font-medium text-dash-text text-sm">
                    {n.label}
                  </div>
                  <div className="text-dash-text-muted text-xs">{n.desc}</div>
                </div>
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
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex items-center gap-4 border-dash-border border-b p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-danger-muted">
            <KeyRound className="h-5 w-5 text-dash-danger" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              Security
            </h3>
            <p className="text-dash-text-muted text-xs">
              Protect your account and data
            </p>
          </div>
        </div>
        <div className="divide-dash-border divide-y p-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-dash-text text-sm">Two-Factor Authentication</div>
              <div className="text-dash-text-muted text-xs">Add an extra layer of security to your account</div>
            </div>
            <button type="button" className="rounded-lg border border-dash-border px-3 py-1.5 text-dash-text-secondary text-xs font-medium hover:bg-dash-surface-hover">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-dash-text text-sm">Active Sessions</div>
              <div className="text-dash-text-muted text-xs">1 active session · Last active: now</div>
            </div>
            <button type="button" className="rounded-lg border border-dash-border px-3 py-1.5 text-dash-text-secondary text-xs font-medium hover:bg-dash-surface-hover">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Billing (placeholder) */}
      <div
        className="dash-card dash-animate-in p-6"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-success-muted">
              <CreditCard className="h-5 w-5 text-dash-success" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                Billing & Plan
              </h3>
              <p className="text-dash-text-muted text-xs">
                Manage your subscription and invoices
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
        <div className="bg-dash-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-dash-text text-sm">
                Delete Account
              </div>
              <div className="text-dash-text-muted text-xs">
                Permanently delete your agency and all data. This cannot be undone.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex items-center gap-2 rounded-xl border border-dash-danger/30 px-4 py-2 font-medium text-dash-danger text-sm transition-colors hover:bg-dash-danger-muted"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {/* Confirmation panel */}
          {showDeleteConfirm && (
            <div className="rounded-xl border border-dash-danger/20 bg-dash-danger-muted/20 p-4 space-y-3">
              <p className="text-dash-danger text-sm font-medium">
                Type <strong>DELETE</strong> to confirm account deletion.
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg border border-dash-danger/30 bg-dash-bg px-3 py-2 text-sm text-dash-danger placeholder-dash-danger/50 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deleteText !== "DELETE"}
                  className="rounded-lg bg-dash-danger px-4 py-2 text-white text-sm font-medium disabled:opacity-40"
                >
                  Permanently Delete
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                  className="rounded-lg px-3 py-2 text-dash-text-muted text-sm hover:bg-dash-surface-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
