"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  socialMediaUrl: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

export default function BookDemo() {
  const t = useTranslations("common.bookDemo");
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    socialMediaUrl: "",
  });
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [waitlistCount] = useState(520);

  const validateForm = () => {
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return false;
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields correctly",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      setStatus({
        type: "success",
        message: "Thanks! Check your email for the next steps.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        companyName: "",
        socialMediaUrl: "",
      });

      setTimeout(() => setStatus({ type: "idle" }), 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  return (
    <section className="bg-primary py-24 md:py-32 lg:py-40" id="book-demo">
      <div className="container">
        {/* Main Content Grid */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text */}
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 max-w-3xl font-Helvetica-Neue font-bold text-3xl text-white leading-tight sm:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="max-w-2xl font-Helvetica text-base text-white/70 leading-relaxed sm:text-lg">
                {t("description")}
              </p>
            </div>

            {/* Waitlist Counter */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-Helvetica-Neue font-bold text-white text-lg">
                    {waitlistCount}+
                  </p>
                  <p className="font-Helvetica text-sm text-white/60">
                    {t("waitlistText")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-Helvetica font-medium text-white/70 text-sm mb-2">
                    {t("firstName")} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder={t("firstNamePlaceholder")}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block font-Helvetica font-medium text-white/70 text-sm mb-2">
                    {t("lastName")} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder={t("lastNamePlaceholder")}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-Helvetica font-medium text-white/70 text-sm mb-2">
                  {t("email")} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block font-Helvetica font-medium text-white/70 text-sm mb-2">
                  {t("companyName")}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder={t("companyNamePlaceholder")}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Social Media URL */}
              <div>
                <label className="block font-Helvetica font-medium text-white/70 text-sm mb-2">
                  {t("socialMediaUrl")}
                </label>
                <input
                  type="url"
                  value={formData.socialMediaUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMediaUrl: e.target.value,
                    })
                  }
                  placeholder={t("socialMediaUrlPlaceholder")}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Status Messages */}
              {status.type === "error" && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <p className="font-Helvetica text-sm text-red-300">
                    {status.message}
                  </p>
                </div>
              )}

              {status.type === "success" && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                  <p className="font-Helvetica text-sm text-green-300">
                    {status.message}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.type === "loading"}
                className="group hover:-translate-y-0.5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-base text-white transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,114,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.type === "loading"
                  ? t("submitting")
                  : t("submitButton")}
                <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
              </button>

              <p className="font-Helvetica text-center text-xs text-white/50">
                {t("privacyText")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
