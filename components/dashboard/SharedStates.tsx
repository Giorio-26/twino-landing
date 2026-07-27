"use client";

import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

// ─── Empty State ───────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dash-surface-secondary mb-4">
        {icon}
      </div>
      <p className="font-Helvetica-Neue font-bold text-dash-text text-lg">{title}</p>
      <p className="mt-2 text-dash-text-muted text-sm max-w-md">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-white text-sm no-underline hover:bg-dash-accent-hover"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-danger-muted mb-4">
        <AlertTriangle className="h-6 w-6 text-dash-danger" />
      </div>
      <p className="font-Helvetica-Neue font-semibold text-dash-text text-base">{title}</p>
      <p className="mt-2 text-dash-text-muted text-sm max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-xl bg-dash-danger px-4 py-2 text-white text-sm font-medium hover:bg-dash-danger-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────
interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function Skeleton({ lines = 1, className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-lg bg-dash-surface-secondary animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-dash-surface-secondary animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-dash-surface-secondary animate-pulse" />
          <div className="h-3 w-24 rounded bg-dash-surface-secondary animate-pulse" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="h-4 rounded bg-dash-surface-secondary animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-dash-surface-secondary animate-pulse" />
        <div className="h-4 w-3/5 rounded bg-dash-surface-secondary animate-pulse" />
      </div>
    </div>
  );
}

// ─── Connection Status Banner ──────────────────────────────────────────
interface ConnectionBannerProps {
  status: "connected" | "disconnected" | "error";
  className?: string;
}

export function ConnectionBanner({ status, className = "" }: ConnectionBannerProps) {
  if (status === "connected") return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
        status === "disconnected"
          ? "bg-dash-warning-muted border-dash-warning/20 border"
          : "bg-dash-danger-muted border-dash-danger/20 border"
      } ${className}`}
    >
      {status === "disconnected" ? (
        <WifiOff className="h-4 w-4 shrink-0 text-dash-warning" />
      ) : (
        <Wifi className="h-4 w-4 shrink-0 text-dash-danger" />
      )}
      <span className="font-medium text-sm">
        {status === "disconnected"
          ? "WhatsApp disconnected. Your AI Twin is offline."
          : "Connection error. Please check your integration settings."}
      </span>
      <Link
        href="/dashboard/integrations"
        className="ml-auto shrink-0 rounded-lg bg-dash-surface px-3 py-1 font-medium text-xs hover:bg-dash-surface-hover"
      >
        Fix
      </Link>
    </div>
  );
}

// ─── AI Activity Indicator ─────────────────────────────────────────────
interface AIActivityProps {
  status: "active" | "idle" | "paused" | "error";
  className?: string;
}

export function AIActivityIndicator({ status, className = "" }: AIActivityProps) {
  const config = {
    active: {
      dot: "bg-dash-success animate-pulse",
      label: "Active",
      textColor: "text-dash-success",
      bg: "bg-dash-success-muted",
    },
    idle: {
      dot: "bg-dash-text-muted",
      label: "Idle",
      textColor: "text-dash-text-muted",
      bg: "bg-dash-surface-secondary",
    },
    paused: {
      dot: "bg-dash-warning",
      label: "Paused",
      textColor: "text-dash-warning",
      bg: "bg-dash-warning-muted",
    },
    error: {
      dot: "bg-dash-danger",
      label: "Error",
      textColor: "text-dash-danger",
      bg: "bg-dash-danger-muted",
    },
  }[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <span className={`font-medium text-xs ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
