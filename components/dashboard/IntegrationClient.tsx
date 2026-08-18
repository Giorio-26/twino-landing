"use client";

import {
  Check,
  CheckCircle2,
  ExternalLink,
  Key,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  SmartphoneNfc,
  Webhook,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type WaState =
  | { phase: "no_phone" }
  | { phase: "checking" }
  | { phase: "connected" }
  | { phase: "ready" }
  | { phase: "loading" }
  | { phase: "qr"; src: string }
  | { phase: "error"; message: string };

const REQUIRED_STEPS: { id: string; label: string; detail: string }[] = [
  { id: "personality", label: "Twin Identity", detail: "set a name for your twin" },
  { id: "guardians", label: "Sales Instructions", detail: "add at least one rule" },
  { id: "properties", label: "Properties", detail: "add at least one property" },
];

// ─── CRM targets (coming soon) ────────────────────────────────────────────────

const CRM_TARGETS = [
  "HubSpot",
  "Salesforce",
  "Bitrix24",
  "Zoho CRM",
  "Google Sheets",
  "Custom API",
];

export default function IntegrationClient({
  hasPhone,
  missingTabs,
}: {
  hasPhone: boolean;
  missingTabs: string[];
}) {
  const notReady = missingTabs.length > 0;

  const [wa, setWa] = useState<WaState>(
    hasPhone && !notReady ? { phase: "checking" } : { phase: "no_phone" },
  );

  const [showWebhook, setShowWebhook] = useState(false);
  const webhookBase = (typeof window !== "undefined"
    ? window.location.origin
    : "https://app.twino.estate") as string;
  const [webhookUrl] = useState(`${webhookBase}/api/events/inbound`);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  useEffect(() => {
    if (!hasPhone || notReady) return;
    fetch("/api/dashboard/whatsapp/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setWa({ phase: "connected" });
        } else if (d.qr) {
          const src = d.qr.startsWith("data:") ? d.qr : `data:image/png;base64,${d.qr}`;
          setWa({ phase: "qr", src });
        } else {
          setWa({ phase: "ready" });
        }
      })
      .catch(() => setWa({ phase: "ready" }));
  }, [hasPhone, notReady]);

  async function handleConnect() {
    setWa({ phase: "loading" });
    try {
      const statusRes = await fetch("/api/dashboard/whatsapp/status");
      const statusData = await statusRes.json();

      if (statusData.connected) {
        setWa({ phase: "connected" });
        return;
      }

      if (statusData.qr) {
        const src = statusData.qr.startsWith("data:")
          ? statusData.qr
          : `data:image/png;base64,${statusData.qr}`;
        setWa({ phase: "qr", src });
        return;
      }

      const res = await fetch("/api/dashboard/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setWa({ phase: "error", message: data.error ?? "Connection failed" });
        return;
      }
      const src = data.qr.startsWith("data:") ? data.qr : `data:image/png;base64,${data.qr}`;
      setWa({ phase: "qr", src });
    } catch {
      setWa({ phase: "error", message: "Network error. Please try again." });
    }
  }

  const isConnected = wa.phase === "connected" || wa.phase === "qr";

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Integrations
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Lead sources, CRM sync, and API access — everything that moves data
          into and out of TwinO.
        </p>
      </div>

      {/* ── SECTION: Lead Sources ─────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-Helvetica-Neue font-semibold text-dash-text text-sm uppercase tracking-wide">
          Lead Sources
        </h3>

        {/* WhatsApp connection status */}
        <div className="dash-card dash-animate-in p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${isConnected ? "bg-[#25D366]/10" : "bg-dash-surface-secondary"}`}
              >
                <MessageSquare
                  className={`h-6 w-6 ${isConnected ? "text-[#25D366]" : "text-dash-text-muted"}`}
                />
              </div>
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                  WhatsApp Business
                </h4>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                  <span
                    className={`h-2 w-2 rounded-full ${isConnected ? "animate-pulse bg-green-500" : "bg-dash-text-muted"}`}
                  />
                  <span
                    className={
                      isConnected ? "text-dash-success" : "text-dash-text-muted"
                    }
                  >
                    {wa.phase === "connected"
                      ? "Connected — twin is receiving messages"
                      : wa.phase === "qr"
                        ? "Scan QR to activate"
                        : "Not connected"}
                  </span>
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 font-medium text-xs ${isConnected ? "bg-green-500/10 text-[#25D366]" : "bg-dash-surface-secondary text-dash-text-muted"}`}
            >
              {wa.phase === "connected"
                ? "Live"
                : wa.phase === "qr"
                  ? "QR Ready"
                  : "Setup Required"}
            </span>
          </div>
        </div>

        {/* WhatsApp connect flow */}
        <div
          className="dash-card dash-animate-in mt-4 overflow-hidden"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 border-dash-border border-b p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10">
              <SmartphoneNfc className="h-5 w-5 text-[#25D366]" />
            </div>
            <div>
              <h4 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                Connect WhatsApp
              </h4>
              <p className="text-dash-text-muted text-xs">
                Scan the QR code with your WhatsApp Business app to activate
                your AI Twin.
              </p>
            </div>
          </div>

          <div className="p-6">
            {notReady ? (
              <div className="flex flex-col items-center gap-5">
                <div className="w-full rounded-2xl border border-dash-warning/30 bg-dash-warning-muted/20 p-5">
                  <p className="mb-4 font-semibold text-dash-text text-sm">
                    Complete your Twin setup before connecting WhatsApp
                  </p>
                  <ul className="space-y-3">
                    {REQUIRED_STEPS.map(({ id, label, detail }) => {
                      const done = !missingTabs.includes(id);
                      return (
                        <li key={id} className="flex items-center gap-2.5">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-dash-success" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-dash-warning" />
                          )}
                          <span
                            className={
                              done
                                ? "text-dash-text-muted text-sm line-through"
                                : "font-medium text-dash-text text-sm"
                            }
                          >
                            {label}
                          </span>
                          {!done && (
                            <span className="text-dash-text-muted text-xs">
                              — {detail}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Link
                  href="/dashboard/configure"
                  className="flex items-center gap-1.5 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white no-underline transition-colors hover:bg-dash-accent-hover"
                >
                  Complete Setup
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                {wa.phase === "checking" && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-dash-accent" />
                    <p className="text-dash-text-secondary text-sm">
                      Checking connection…
                    </p>
                  </div>
                )}

                {wa.phase === "connected" && (
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-dash-success/30 bg-dash-success/5 px-6 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dash-success/10">
                      <Check className="h-7 w-7 text-dash-success" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-dash-text text-sm">
                        WhatsApp is connected
                      </p>
                      <p className="text-dash-text-muted text-xs">
                        Your AI Twin is active and receiving messages.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="flex items-center gap-1.5 text-dash-text-muted text-xs transition-colors hover:text-dash-text"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Re-link device
                    </button>
                  </div>
                )}

                {wa.phase === "no_phone" && (
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-dash-warning/30 bg-dash-warning-muted/20 px-6 py-8 text-center">
                    <p className="text-dash-text text-sm">
                      A phone number is required before connecting WhatsApp.
                    </p>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-1.5 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white no-underline transition-colors hover:bg-dash-accent-hover"
                    >
                      Add Phone in Settings
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                {wa.phase === "ready" && (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="max-w-sm text-dash-text-secondary text-sm">
                      Click below to generate a QR code. Scan it with WhatsApp
                      Business on your phone to link your number to TwinO.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-green-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Connect WhatsApp
                    </button>
                  </div>
                )}

                {wa.phase === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-dash-accent" />
                    <p className="text-dash-text-secondary text-sm">
                      Generating QR code…
                    </p>
                  </div>
                )}

                {wa.phase === "qr" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-2xl border border-dash-border bg-white p-4 shadow-sm">
                      <Image
                        src={wa.src}
                        alt="WhatsApp QR Code"
                        width={224}
                        height={224}
                        className="h-56 w-56"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-dash-text text-sm">
                        Scan with WhatsApp Business
                      </p>
                      <p className="text-dash-text-muted text-xs">
                        Open WhatsApp → Linked Devices → Link a Device
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="flex items-center gap-1.5 text-dash-text-muted text-xs transition-colors hover:text-dash-text"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Generate new QR
                    </button>
                  </div>
                )}

                {wa.phase === "error" && (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-danger-muted">
                      <XCircle className="h-6 w-6 text-dash-danger" />
                    </div>
                    <p className="text-dash-danger text-sm font-medium">
                      {wa.message}
                    </p>
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-dash-accent-hover"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Other sources (coming soon) */}
        <div className="dash-card dash-animate-in mt-4 p-5" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-dash-text-muted" />
              <p className="text-dash-text text-sm">
                Messenger, Instagram, Viber &amp; website chat widgets
              </p>
            </div>
            <span className="rounded-full bg-dash-purple-muted px-3 py-1 font-semibold text-dash-purple text-xs">
              Coming Soon
            </span>
          </div>
          <p className="mt-2 text-dash-text-muted text-xs">
            More channels will be available as your pilot grows. For now,
            WhatsApp carries all inbound conversations.
          </p>
        </div>
      </div>

      {/* ── SECTION: CRM Sync ────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-Helvetica-Neue font-semibold text-dash-text text-sm uppercase tracking-wide">
          CRM Sync
        </h3>
        <div className="dash-card dash-animate-in p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                Auto-export qualified leads
              </h4>
              <p className="mt-0.5 text-dash-text-muted text-xs">
                Every qualified lead automatically synced to your CRM. No more
                manual copy-paste.
              </p>
            </div>
            <span className="rounded-full bg-dash-purple-muted px-3 py-1 font-semibold text-dash-purple text-xs">
              Coming Soon
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CRM_TARGETS.map((crm) => (
              <span
                key={crm}
                className="rounded-lg bg-dash-surface-secondary px-3 py-1.5 text-dash-text-secondary text-xs font-medium"
              >
                {crm}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION: API Access ──────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-Helvetica-Neue font-semibold text-dash-text text-sm uppercase tracking-wide">
          API Access
        </h3>
        <div className="dash-card dash-animate-in overflow-hidden">
          <button
            type="button"
            onClick={() => setShowWebhook(!showWebhook)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-purple-muted">
                <Webhook className="h-5 w-5 text-dash-purple" />
              </div>
              <div>
                <h4 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                  Webhook &amp; API Key
                </h4>
                <p className="text-dash-text-muted text-xs">
                  Connect external systems and automate data flow
                </p>
              </div>
            </div>
            <span className={`text-dash-text-muted text-xs transition-colors ${showWebhook ? "text-dash-accent" : ""}`}>
              {showWebhook ? "Collapse" : "Expand"}
            </span>
          </button>

          {showWebhook && (
            <div className="border-dash-border border-t p-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  Webhook URL (inbound events)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-bg px-4 py-2.5">
                  <code className="flex-1 truncate font-mono text-dash-text text-sm">
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(webhookUrl)}
                    className="shrink-0 text-xs text-dash-text-muted transition-colors hover:text-dash-accent"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-dash-text-secondary text-xs">
                  API Key
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-bg px-4 py-2.5">
                  <Key className="h-4 w-4 shrink-0 text-dash-text-muted" />
                  <code className="flex-1 font-mono text-dash-text text-sm">
                    ••••••••••••••••••••
                  </code>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(webhookUrl);
                      setApiKeyCopied(true);
                      setTimeout(() => setApiKeyCopied(false), 2000);
                    }}
                    className="shrink-0 text-xs text-dash-text-muted transition-colors hover:text-dash-accent"
                  >
                    {apiKeyCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-dash-text-muted text-xs">
                Use these credentials to integrate with your CRM, marketing
                tools, or custom backend. During the pilot, your API key is
                provided by the TwinO team.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
