"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialError, setCredentialError] = useState(false);
  const router = useRouter();

  function friendlyError(message: string): string {
    if (
      message.toLowerCase().includes("invalid login credentials") ||
      message.toLowerCase().includes("invalid credentials")
    ) {
      return "Incorrect email or password. Please try again.";
    }
    if (message.toLowerCase().includes("email not confirmed")) {
      return "Please verify your email address before signing in.";
    }
    if (message.toLowerCase().includes("too many requests")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.toLowerCase().includes("user not found")) {
      return "No account found with this email address.";
    }
    return "Something went wrong. Please try again.";
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCredentialError(false);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(friendlyError(authError.message));
      setCredentialError(true);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (credentialError) {
      setError(null);
      setCredentialError(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (credentialError) {
      setError(null);
      setCredentialError(false);
    }
  };

  return (
    <div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background — matching landing page style */}
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
            Sign in to your agency dashboard
          </p>
        </div>

        {/* Login Card — glassmorphism like landing */}
        <div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="dash-animate-scale flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                <span className="shrink-0 text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block font-medium text-primary/70 text-sm"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@agency.com"
                  required
                  className={`w-full rounded-xl border bg-white py-3.5 pr-4 pl-11 text-primary text-sm placeholder-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 ${credentialError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/10 focus:border-accent/40 focus:ring-accent/10"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block font-medium text-primary/70 text-sm"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  className={`w-full rounded-xl border bg-white py-3.5 pr-12 pl-4 text-primary text-sm placeholder-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 ${credentialError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/10 focus:border-accent/40 focus:ring-accent/10"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="-translate-y-1/2 absolute top-1/2 right-4 text-primary/30 hover:text-primary/50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group hover:-translate-y-0.5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:shadow-accent/20 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-primary/40 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/dashboard/register"
            className="font-medium text-accent no-underline hover:text-accent/80"
          >
            Register your agency
          </Link>
        </p>
      </div>
    </div>
  );
}
