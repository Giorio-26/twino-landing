"use client";

import { format } from "date-fns";
import { enUS, ka } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const TZ_OFFSET_HOURS = 4;
const ALL_SLOT_HOURS: number[] = Array.from({ length: 11 }, (_, i) => i + 10);

function formatSlotLabel(hour: number) {
  const ampm = hour < 12 ? "AM" : "PM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${ampm}`;
}

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const DEFAULT_FORM = {
  firstName: "ნიკოლოზ",
  lastName: "ჭავჭანიძე",
  email: "nikolozchavchanidze@gmail.com",
  phone: "+995558141190",
  companyName: "NTCH",
  socialMediaUrl: "https://tchavtchanidze.com",
};

const BANNER_ICON_COLORS = [
  "bg-amber-500/10 text-amber-400",
  "bg-accent/10 text-accent",
  "bg-green-500/10 text-green-400",
  "bg-purple-500/10 text-purple-400",
] as const;

const BANNER_ICONS = [
  <Zap key="zap" className="size-4" />,
  <Clock key="clock" className="size-4" />,
  <Shield key="shield" className="size-4" />,
  <Users key="users" className="size-4" />,
];

export default function BookADemoClient() {
  const t = useTranslations("common.bookADemoPage");
  const locale = useLocale();
  const dateLocale = locale === "ka" ? ka : enUS;

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{
    date: Date;
    hour: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isToday = selectedDate?.toDateString() === new Date().toDateString();
  const nowLocalHour = new Date().getHours();

  function isSlotDisabled(hour: number) {
    return isToday && hour <= nowLocalHour;
  }

  const validate = (): string | null => {
    if (!formData.firstName.trim()) return t("form.errorFirstName");
    if (!formData.lastName.trim()) return t("form.errorLastName");
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return t("form.errorEmail");
    if (!selectedDate) return t("form.errorDate");
    if (selectedHour === null) return t("form.errorTime");
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    // biome-ignore lint/style/noNonNullAssertion: guarded by validate()
    setBookedSlot({ date: selectedDate!, hour: selectedHour! });
    setSubmitted(true);
    setError(null);
  };

  const bannerFeatures = [
    t("banner.feature1"),
    t("banner.feature2"),
    t("banner.feature3"),
    t("banner.feature4"),
  ];

  return (
    <section className="px-4 pb-16 pt-28 sm:px-6 lg:pb-24 lg:pt-32">
      <div className="mx-auto w-full max-w-5xl">
        {submitted && bookedSlot ? (
          <SuccessCard
            slot={bookedSlot}
            name={formData.firstName}
            t={t}
            dateLocale={dateLocale}
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] lg:flex">
            {/* ── Left banner ── */}
            <aside className="relative flex flex-col justify-between overflow-hidden bg-primary p-8 sm:p-10 lg:w-[42%] xl:w-[40%] xl:p-12">
              <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-0 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-accent/15 blur-3xl" />

              <div className="relative z-10">
                <Image
                  src="/images/twino-w.svg"
                  alt="TwinO"
                  width={110}
                  height={30}
                  priority
                />
              </div>

              <div className="relative z-10 space-y-4 py-8 lg:py-0">
                <h2 className="font-Helvetica-Neue font-bold text-3xl text-white leading-tight xl:text-4xl">
                  {t("banner.title1")}
                  <br />
                  <span className="text-accent">{t("banner.title2")}</span>
                </h2>
                <p className="max-w-xs font-Helvetica text-sm text-white/55 leading-relaxed xl:text-base">
                  {t("banner.description")}
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                <ul className="space-y-3">
                  {bannerFeatures.map((text, i) => (
                    <li key={text} className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${BANNER_ICON_COLORS[i]}`}
                      >
                        {BANNER_ICONS[i]}
                      </span>
                      <span className="font-Helvetica text-sm text-white/70">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-white/10 border-t pt-4">
                  <p className="font-Helvetica text-white/25 text-xs">
                    {t("banner.tagline")}
                  </p>
                </div>
              </div>
            </aside>

            {/* ── Right form panel ── */}
            <main className="flex-1 overflow-y-auto bg-white px-8 py-8 sm:px-10 xl:px-12 xl:py-10">
              <div className="mb-6 lg:hidden">
                <Image
                  src="/images/twino.svg"
                  alt="TwinO"
                  width={100}
                  height={27}
                  priority
                />
              </div>

              <div className="mb-6">
                <h3 className="mb-1.5 font-Helvetica-Neue font-bold text-primary text-xl">
                  {t("form.title")}
                </h3>
                <p className="font-Helvetica text-primary/40 text-sm">
                  {t("form.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label={t("form.firstName")}
                    required
                    value={formData.firstName}
                    onChange={(v) => setFormData({ ...formData, firstName: v })}
                    placeholder={t("form.firstNamePlaceholder")}
                  />
                  <FormField
                    label={t("form.lastName")}
                    required
                    value={formData.lastName}
                    onChange={(v) => setFormData({ ...formData, lastName: v })}
                    placeholder={t("form.lastNamePlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label={t("form.email")}
                    required
                    type="email"
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    placeholder={t("form.emailPlaceholder")}
                  />
                  <FormField
                    label={t("form.phone")}
                    type="tel"
                    value={formData.phone}
                    onChange={(v) => setFormData({ ...formData, phone: v })}
                    placeholder={t("form.phonePlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label={t("form.companyName")}
                    value={formData.companyName}
                    onChange={(v) =>
                      setFormData({ ...formData, companyName: v })
                    }
                    placeholder={t("form.companyNamePlaceholder")}
                  />
                  <FormField
                    label={t("form.websiteSocial")}
                    type="url"
                    value={formData.socialMediaUrl}
                    onChange={(v) =>
                      setFormData({ ...formData, socialMediaUrl: v })
                    }
                    placeholder={t("form.websiteSocialPlaceholder")}
                  />
                </div>

                {/* Date / Time toggle */}
                {!selectedDate ? (
                  <div>
                    <p className="mb-2 font-Helvetica font-medium text-primary/50 text-sm">
                      {t("form.pickDate")} *
                    </p>
                    <div className="book-demo-datepicker-light overflow-hidden rounded-xl border border-black/[0.07]">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          setSelectedDate(date);
                          setSelectedHour(null);
                        }}
                        minDate={todayMidnight()}
                        dateFormat="MMMM d, yyyy"
                        placeholderText={t("form.pickDate")}
                        inline
                        locale={dateLocale}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(null);
                          setSelectedHour(null);
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/8 text-primary/40 transition-colors hover:border-accent/40 hover:text-accent"
                        aria-label={t("form.backToCalendar")}
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <p className="font-Helvetica font-medium text-primary/70 text-sm">
                        {format(selectedDate, "EEEE, d MMMM yyyy", {
                          locale: dateLocale,
                        })}
                      </p>
                    </div>

                    <p className="mb-2.5 flex items-center gap-1.5 font-Helvetica font-medium text-primary/50 text-sm">
                      <Clock className="size-3.5" />
                      {t("form.pickTime")} *
                      <span className="text-primary/30 text-xs">
                        ({t("form.tbilisiTime")})
                      </span>
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
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
                              "rounded-lg border py-2 font-Helvetica text-xs transition-all duration-150",
                              disabled
                                ? "cursor-not-allowed border-black/5 bg-gray-50 text-primary/20 line-through"
                                : selected
                                  ? "border-accent bg-accent text-white shadow-[0_0_10px_rgba(0,114,255,0.22)]"
                                  : "border-black/[0.08] bg-white text-primary/60 hover:border-accent/40 hover:text-primary",
                            ].join(" ")}
                          >
                            {formatSlotLabel(hour)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="font-Helvetica text-red-600 text-sm">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="group hover:-translate-y-0.5 mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-Helvetica-Neue font-semibold text-sm text-white transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.28)] active:translate-y-0"
                >
                  {t("form.submit")}
                  <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
                </button>

                <p className="text-center font-Helvetica text-primary/30 text-xs">
                  {t("form.privacy")}
                </p>
              </form>
            </main>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Success card ────────────────────────────────────────────────────────────

function SuccessCard({
  slot,
  name,
  t,
  dateLocale,
}: {
  slot: { date: Date; hour: number };
  name: string;
  t: ReturnType<typeof useTranslations<"common.bookADemoPage">>;
  dateLocale: Locale;
}) {
  const steps = [
    t("success.step1"),
    t("success.step2"),
    t("success.step3"),
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="px-8 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.07]">
          <CalendarCheck className="size-9 text-accent" />
        </div>

        <div className="mb-6 flex justify-center">
          <Image src="/images/twino.svg" alt="TwinO" width={90} height={24} />
        </div>

        <h2 className="mb-3 font-Helvetica-Neue font-bold text-2xl text-primary sm:text-3xl">
          {t("success.title", { name })}
        </h2>
        <p className="mx-auto mb-8 max-w-sm font-Helvetica text-primary/50 text-sm leading-relaxed sm:text-base">
          {t("success.message")}
        </p>

        <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-black/[0.07] bg-accent-secondary-light px-6 py-5">
          <p className="mb-1.5 font-Helvetica text-[10px] text-primary/35 uppercase tracking-widest">
            {t("success.scheduledFor")}
          </p>
          <p className="font-Helvetica-Neue font-semibold text-lg text-primary">
            {format(slot.date, "EEEE, d MMMM yyyy", { locale: dateLocale })}
          </p>
          <p className="mt-0.5 font-Helvetica text-base text-primary/55">
            {formatSlotLabel(slot.hour)}{" "}
            <span className="text-primary/30 text-xs">
              (Tbilisi GMT+{TZ_OFFSET_HOURS})
            </span>
          </p>
        </div>

        <div className="mx-auto mb-8 max-w-sm rounded-xl border border-black/[0.06] px-5 py-4 text-left">
          <p className="mb-3 font-Helvetica font-semibold text-[10px] text-primary/40 uppercase tracking-wider">
            {t("success.whatsNext")}
          </p>
          <ul className="space-y-2.5">
            {steps.map((step) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 font-Helvetica text-[9px] text-accent">
                  ✓
                </span>
                <span className="font-Helvetica text-primary/60 text-sm">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 font-Helvetica font-medium text-primary/35 text-sm no-underline transition-colors hover:text-primary"
        >
          <ArrowLeft className="group-hover:-translate-x-0.5 size-3.5 transition-transform" />
          {t("success.back")}
        </Link>
      </div>
    </div>
  );
}

// ── FormField ───────────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block font-Helvetica font-medium text-primary/50 text-sm">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-black/8 bg-white px-3.5 py-2.5 font-Helvetica text-primary text-sm placeholder-primary/25 transition-all duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
