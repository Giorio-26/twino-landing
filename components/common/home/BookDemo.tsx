"use client";

import { format } from "date-fns";
import { enUS, ka } from "date-fns/locale";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ─── Slot config (Tbilisi GMT+4) ─────────────────────────────────────────────
const TZ_OFFSET_HOURS = 4;
// 11 hourly slots: 10:00–20:00 local
const ALL_SLOT_HOURS: number[] = Array.from({ length: 11 }, (_, i) => i + 10);
const COUNTRY_CODES = [
  { code: "+995", region: "GE" },
  { code: "+1", region: "US" },
  { code: "+44", region: "UK" },
  { code: "+49", region: "DE" },
  { code: "+33", region: "FR" },
  { code: "+39", region: "IT" },
  { code: "+34", region: "ES" },
];

function formatSlotLabel(hour: number) {
  const ampm = hour < 12 ? "AM" : "PM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${ampm}`;
}

/** Convert a local Tbilisi date + hour to an ISO UTC string */
function toUtcIso(date: Date, localHour: number): string {
  // Build a UTC date where local time = localHour:00 Tbilisi (UTC+4)
  const utc = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      localHour - TZ_OFFSET_HOURS,
      0,
      0,
      0,
    ),
  );
  return utc.toISOString();
}

/** Returns midnight of today in local time (no time component) */
function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  companyName: string;
  socialMediaUrl: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookDemo() {
  const t = useTranslations("common.bookDemo");
  const locale = useLocale();

  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+995",
    companyName: "",
    socialMediaUrl: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookedHours, setBookedHours] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [bookedSlot, setBookedSlot] = useState<{
    date: Date;
    hour: number;
  } | null>(null);

  // ── Fetch booked slots whenever the date changes ──────────────────────────
  const fetchAvailability = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    setSelectedHour(null);
    try {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const res = await fetch(
        `/api/book-demo/availability?date=${yyyy}-${mm}-${dd}`,
      );
      if (res.ok) {
        const json = await res.json();
        setBookedHours(json.bookedHours ?? []);
      }
    } catch {
      // non-critical — worst case all slots appear available
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return false;
    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-()]/g, "");
      if (!/^\d{4,15}$/.test(cleanPhone)) return false;
      if (!/^\+\d{1,4}$/.test(formData.countryCode)) return false;
    }
    if (!selectedDate || selectedHour === null) return false;
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({
        type: "error",
        message: t("validationError"),
      });
      return;
    }

    setStatus({ type: "loading" });

    // biome-ignore lint/style/noNonNullAssertion: guarded by validateForm
    const scheduledAt = toUtcIso(selectedDate!, selectedHour!);

    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, scheduledAt }),
      });

      if (response.status === 409) {
        // Slot was taken between selection and submit
        setStatus({ type: "error", message: t("slotTaken") });
        // biome-ignore lint/style/noNonNullAssertion: guarded by validateForm
        fetchAvailability(selectedDate!);
        return;
      }

      if (!response.ok) throw new Error("Failed to submit form");

      // biome-ignore lint/style/noNonNullAssertion: guarded by validateForm
      setBookedSlot({ date: selectedDate!, hour: selectedHour! });
      setStatus({ type: "success" });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        countryCode: "+995",
        companyName: "",
        socialMediaUrl: "",
      });
      setSelectedDate(null);
      setSelectedHour(null);
      setBookedHours([]);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const isToday = selectedDate
    ? selectedDate.toDateString() === new Date().toDateString()
    : false;

  const nowLocalHour = new Date().getHours();

  function isSlotDisabled(hour: number) {
    if (bookedHours.includes(hour)) return true;
    // Disable past hours if the selected date is today
    if (isToday && hour <= nowLocalHour) return true;
    return false;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="bg-primary py-24 md:py-32 lg:py-40" id="book-demo">
      <div className="container">
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center">
            <h2 className="mb-4 max-w-4xl text-center font-Helvetica-Neue font-bold text-3xl text-white leading-tight sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-3xl text-center font-Helvetica text-base text-white/70 leading-relaxed sm:text-lg">
              {t("description")}
            </p>
          </div>

          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {status.type === "success" && bookedSlot ? (
              <div className="flex flex-col items-center gap-6 py-8 text-center">
                <div className="flex size-20 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                  <CalendarCheck className="size-10 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-Helvetica-Neue font-bold text-2xl text-white">
                    {t("successTitle")}
                  </h3>
                  <p className="font-Helvetica text-base text-white/60">
                    {t("successMessage")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
                  <p className="font-Helvetica text-sm text-white/50">
                    {t("selectDate")}
                  </p>
                  <p className="mt-1 font-Helvetica font-semibold text-white">
                    {format(bookedSlot.date, "EEEE, d MMMM yyyy", {
                      locale: locale === "ka" ? ka : enUS,
                    })}
                    {" · "}
                    {formatSlotLabel(bookedSlot.hour)}{" "}
                    <span className="text-white/40 text-xs">
                      ({t("tbilisiTime")})
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: First & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                      {t("firstName")} *
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder={t("firstNamePlaceholder")}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                      {t("lastName")} *
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
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                    {t("email")} *
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
                  </label>
                </div>

                {/* Phone */}
                <div>
                  <p className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                    {t("phone")}
                  </p>
                  <div className="grid grid-cols-[130px_1fr] gap-3">
                    <select
                      value={formData.countryCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          countryCode: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 font-Helvetica text-sm text-white transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                          className="bg-primary text-white"
                        >
                          {country.region} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder={t("phonePlaceholder")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                    {t("companyName")}
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      placeholder={t("companyNamePlaceholder")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-Helvetica text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </label>
                </div>

                {/* Social Media URL */}
                <div>
                  <label className="mb-2 block font-Helvetica font-medium text-sm text-white/70">
                    {t("socialMediaUrl")}
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
                  </label>
                </div>

                {/* ── Date picker ── */}
                <div>
                  <p className="mb-2 font-Helvetica font-medium text-sm text-white/70">
                    {t("selectDate")} *
                  </p>
                  <div className="book-demo-datepicker">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      minDate={todayMidnight()}
                      dateFormat="MMMM d, yyyy"
                      placeholderText={t("datePlaceholder")}
                      inline
                      locale={locale === "ka" ? ka : enUS}
                      calendarClassName="book-demo-calendar"
                    />
                  </div>
                </div>

                {/* ── Time slot grid ── */}
                {selectedDate && (
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 font-Helvetica font-medium text-sm text-white/70">
                      <Clock className="size-3.5" />
                      {t("selectTime")} *{" "}
                      <span className="text-white/40 text-xs">
                        ({t("tbilisiTime")})
                      </span>
                    </p>

                    {loadingSlots ? (
                      <div className="flex justify-center py-4">
                        <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {ALL_SLOT_HOURS.map((hour) => {
                          const disabled = isSlotDisabled(hour);
                          const selected = selectedHour === hour;
                          return (
                            <button
                              key={hour}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedHour(hour)}
                              className={[
                                "rounded-lg border py-2.5 font-Helvetica text-sm transition-all duration-150",
                                disabled
                                  ? "cursor-not-allowed border-white/5 bg-white/5 text-white/20 line-through"
                                  : selected
                                    ? "border-accent bg-accent text-white shadow-[0_0_12px_rgba(0,114,255,0.4)]"
                                    : "border-white/10 bg-white/5 text-white/70 hover:border-accent/60 hover:bg-white/10 hover:text-white",
                              ].join(" ")}
                            >
                              {formatSlotLabel(hour)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Status messages */}
                {status.type === "error" && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="font-Helvetica text-red-300 text-sm">
                      {status.message}
                    </p>
                  </div>
                )}

                {status.type === "success" && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <p className="font-Helvetica text-green-300 text-sm">
                      {status.message}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="group hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-base text-white transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,114,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status.type === "loading"
                    ? t("submitting")
                    : t("submitButton")}
                  <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
                </button>

                <p className="text-center font-Helvetica text-white/50 text-xs">
                  {t("privacyText")}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
