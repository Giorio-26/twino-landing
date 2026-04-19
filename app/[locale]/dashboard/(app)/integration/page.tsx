"use client";

import {
  Bell,
  Check,
  Circle,
  Copy,
  ExternalLink,
  MessageSquare,
  Send,
  Shield,
  Webhook,
  Zap,
} from "lucide-react";
import { useState } from "react";

const webhookUrl = "https://twino.estate/api/webhook/YOUR_AGENCY_ID";

const steps = [
  {
    num: 1,
    title: "Create Meta Business Account",
    desc: "Go to business.facebook.com and create a business account if you don't have one.",
    link: "https://business.facebook.com",
  },
  {
    num: 2,
    title: "Set Up WhatsApp Business API",
    desc: "In Meta Business Suite, navigate to WhatsApp > Getting Started and follow the setup wizard.",
    link: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
  },
  {
    num: 3,
    title: "Configure Webhook URL",
    desc: "In your WhatsApp app settings, set the webhook URL to your unique TwinO endpoint (shown below).",
  },
  {
    num: 4,
    title: "Verify & Test",
    desc: "Send a test message to your WhatsApp Business number. If everything is set up correctly, you'll see it appear in TwinO.",
  },
];

export default function IntegrationPage() {
  const [copied, setCopied] = useState(false);
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
                WhatsApp Business
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <Circle className="h-2.5 w-2.5 fill-dash-text-muted text-dash-text-muted" />
                <span className="text-dash-text-muted">Not Connected</span>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-dash-surface-secondary px-3 py-1 font-medium text-dash-text-muted text-xs">
            Setup Required
          </span>
        </div>
      </div>

      {/* WhatsApp Setup Steps */}
      <div
        className="dash-card dash-animate-in overflow-hidden"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="border-dash-border border-b p-6">
          <h3 className="font-Helvetica-Neue font-semibold text-base text-dash-text">
            WhatsApp Setup Guide
          </h3>
          <p className="mt-1 text-dash-text-muted text-xs">
            Follow these steps to connect your WhatsApp Business number.
          </p>
        </div>
        <div className="space-y-6 p-6">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dash-border bg-dash-surface-secondary font-bold text-dash-text-secondary text-sm">
                {step.num}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
                  {step.title}
                </h4>
                <p className="mt-1 text-dash-text-muted text-xs leading-relaxed">
                  {step.desc}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-dash-accent text-xs no-underline hover:text-dash-accent-hover"
                  >
                    Open Guide <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Webhook URL */}
          <div className="rounded-xl border border-dash-accent/20 bg-dash-accent-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Webhook className="h-4 w-4 text-dash-accent" />
              <span className="font-semibold text-dash-accent text-xs">
                Your Webhook URL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-dash-bg px-3 py-2.5 font-mono text-dash-text text-xs">
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={copyWebhook}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-white transition-colors hover:bg-dash-accent-hover"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Notifications */}
      <div
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
      </div>

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
