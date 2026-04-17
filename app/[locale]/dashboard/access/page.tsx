"use client";

import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

function formatKey(raw: string): string {
  // Keep only hex chars, uppercase, max 16
  const clean = raw.replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(0, 16);
  // Split into groups of 4 separated by dashes
  return clean.match(/.{1,4}/g)?.join("-") ?? clean;
}

export default function AccessPage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setKey(formatKey(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stripped = key.replace(/-/g, "");
    if (stripped.length !== 16) {
      setError("Please enter the full 16-character access key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/verify-access-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/${params.locale}/dashboard`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background blobs — matching landing page style */}
      <div className="pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 absolute top-0 left-1/2 h-[600px] w-[800px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="dash-animate-in relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 no-underline"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-lg text-white shadow-accent/20 shadow-lg">
              T
            </div>
            <span className="font-Helvetica-Neue font-bold text-2xl text-primary">
              Twin<span className="text-accent">O</span>
            </span>
          </Link>
          <p className="mt-3 text-primary/50 text-sm">
            Enter your access key to get started
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="dash-animate-scale flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                <span className="shrink-0 text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="access-key"
                className="block font-medium text-primary/70 text-sm"
              >
                Access Key
              </label>
              <div className="relative">
                <KeyRound className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                <input
                  id="access-key"
                  type="text"
                  value={key}
                  onChange={handleKeyChange}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className={`w-full rounded-xl border bg-white py-3.5 pr-4 pl-11 font-mono text-primary text-sm tracking-widest placeholder-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/10 focus:border-accent/40 focus:ring-accent/10"}`}
                />
              </div>
              <p className="text-primary/40 text-xs">
                You received this key via email after your demo.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group hover:-translate-y-0.5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:shadow-accent/20 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
