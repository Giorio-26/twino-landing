"use client";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    agencyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          agency_name: formData.agencyName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const inputCls =
    "w-full rounded-xl border border-black/10 bg-white py-3.5 px-4 text-sm text-primary placeholder-primary/30 transition-all duration-200 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/10";
  const inputIconCls = `${inputCls} pl-11`;

  return (
    <div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-white py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[500px] w-[700px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="dash-animate-in relative z-10 w-full max-w-lg px-6">
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
            Register your real estate agency
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-xl backdrop-blur-md">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="dash-animate-scale flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                <span className="shrink-0 text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="reg-agency"
                className="block font-medium text-primary/70 text-sm"
              >
                Agency Name
              </label>
              <div className="relative">
                <Building2 className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                <input
                  id="reg-agency"
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => updateField("agencyName", e.target.value)}
                  placeholder="Sakura Properties"
                  required
                  className={inputIconCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="reg-first"
                  className="block font-medium text-primary/70 text-sm"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                  <input
                    id="reg-first"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="John"
                    required
                    className={inputIconCls}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="reg-last"
                  className="block font-medium text-primary/70 text-sm"
                >
                  Last Name
                </label>
                <input
                  id="reg-last"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Doe"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reg-email"
                className="block font-medium text-primary/70 text-sm"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                <input
                  id="reg-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@sakuraproperties.ge"
                  required
                  className={inputIconCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reg-phone"
                className="block font-medium text-primary/70 text-sm"
              >
                Phone
              </label>
              <div className="relative">
                <Phone className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-primary/30" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+995 555 123 456"
                  className={inputIconCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reg-password"
                className="block font-medium text-primary/70 text-sm"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`${inputCls} pr-12`}
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

            <div className="space-y-2">
              <label
                htmlFor="reg-confirm"
                className="block font-medium text-primary/70 text-sm"
              >
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="••••••••"
                required
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group hover:-translate-y-0.5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:shadow-accent/20 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Agency Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-primary/40 text-sm">
          Already have an account?{" "}
          <Link
            href="/dashboard/login"
            className="font-medium text-accent no-underline hover:text-accent/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
