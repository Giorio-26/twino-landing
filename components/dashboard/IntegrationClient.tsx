"use client";

import {
  Bell,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Shield,
  SmartphoneNfc,
  Zap,
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

const inputCls =
  "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

export default function IntegrationClient({ hasPhone }: { hasPhone: boolean }) {
  const [wa, setWa] = useState<WaState>(
    hasPhone ? { phase: "checking" } : { phase: "no_phone" },
  );
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    if (!hasPhone) return;
    fetch("/api/dashboard/whatsapp/status")
      .then((r) => r.json())
      .then((d) => {
        setWa(d.connected ? { phase: "connected" } : { phase: "ready" });
      })
      .catch(() => setWa({ phase: "ready" }));
  }, [hasPhone]);

  async function handleConnect() {
    setWa({ phase: "loading" });
    try {
      const res = await fetch("/api/dashboard/whatsapp/connect", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setWa({ phase: "error", message: data.error ?? "Connection failed" });
        return;
      }
      setWa({ phase: "qr", src: data.qr });
    } catch {
      setWa({ phase: "error", message: "Network error. Please try again." });
    }
  }

  const isConnected = wa.phase === "connected" || wa.phase === "qr";

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Integration
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Connect your communication channels to TwinO.
        </p>
      </div>

      {/* Connection Status */}
      <div
        className="dash-card dash-animate-in p-6"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${isConnected ? "bg-dash-success/10" : "bg-dash-surface-secondary"}`}
            >
              <MessageSquare
                className={`h-6 w-6 ${isConnected ? "text-dash-success" : "text-dash-text-muted"}`}
              />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                WhatsApp Business
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${isConnected ? "animate-pulse bg-dash-success" : "bg-dash-text-muted"}`}
                />
                <span
                  className={
                    isConnected ? "text-dash-success" : "text-dash-text-muted"
                  }
                >
                  {wa.phase === "connected"
                    ? "Connected"
                    : wa.phase === "qr"
                      ? "Scan QR to activate"
                      : "Not Connected"}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-medium text-xs ${isConnected ? "bg-dash-success/10 text-dash-success" : "bg-dash-surface-secondary text-dash-text-muted"}`}
          >
            {wa.phase === "connected"
              ? "Connected"
              : wa.phase === "qr"
                ? "QR Ready"
                : "Setup Required"}
          </span>
        </div>
      </div>

      {/* WhatsApp Connect */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-3 border-dash-border border-b p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <SmartphoneNfc className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
              Connect WhatsApp
            </h3>
            <p className="text-dash-text-muted text-xs">
              Scan the QR code with your WhatsApp Business app to activate your
              AI Twin.
            </p>
          </div>
        </div>

        <div className="p-6">
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
              <p className="text-dash-danger text-sm">{wa.message}</p>
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
        </div>
      </div>

      {/* Telegram Notifications */}
      {/* <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="border-dash-border border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent-muted">
              <Bell className="h-5 w-5 text-dash-accent" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                Telegram Notifications
              </h3>
              <p className="text-dash-text-muted text-xs">
                Get notified when agent takeover is needed.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Bot Token
              <input
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Chat ID
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="-1001234567890"
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover"
            >
              <Shield className="h-4 w-4" />
              Save
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-dash-border px-4 py-2.5 font-medium text-dash-text-secondary text-sm hover:bg-dash-surface-hover"
            >
              <Send className="h-4 w-4" />
              Test Notification
            </button>
          </div>
        </div>
      </div> */}

      {/* Google Sheets / CRM Placeholder */}
      <div
        className="dash-card dash-animate-in p-6 opacity-60"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-surface-secondary">
              <Zap className="h-6 w-6 text-dash-text-muted" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                Google Sheets / CRM
              </h3>
              <p className="text-dash-text-muted text-xs">
                Auto-export leads to your spreadsheet.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-dash-purple-muted px-3 py-1 font-semibold text-dash-purple text-xs">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
