"use client";

import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TermsModal } from "@/components/event/TermsModal";

function formatKey(raw: string): string {
  const clean = raw
    .replace(/[^a-fA-F0-9]/g, "")
    .toUpperCase()
    .slice(0, 16);
  return clean.match(/.{1,4}/g)?.join("-") ?? clean;
}

export default function OrganizerAccessPage() {
  const t = useTranslations("dashboard.event.organizer.access");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setKey(formatKey(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const stripped = key.replace(/-/g, "");
    if (stripped.length !== 16) {
      setError(t("keyError"));
      return;
    }

    if (!termsAccepted) {
      setError(t("termsError"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/event/verify-organizer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, termsAccepted: true }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? t("genericError"));
        return;
      }

      router.push(`/${params.locale}/event/organizer`);
      router.refresh();
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 absolute top-0 left-1/2 h-150 w-200 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-100 w-150 rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="dash-animate-in relative z-10 w-full max-w-md px-6">
        <div className="mb-10 text-center">
          <Image
            className="mx-auto"
            src="/images/twino.svg"
            alt="Twino"
            width={120}
            height={32}
            priority
          />
          <p className="mt-3 text-primary/50 text-sm">{t("subtitle")}</p>
        </div>

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
                {t("keyLabel")}
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
              <p className="text-primary/40 text-xs">{t("keyHint")}</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (error === t("termsError")) setError(null);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent"
              />
              <span className="text-primary/60 text-sm">
                {t("termsPrefix")}{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsOpen(true);
                  }}
                  className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
                >
                  {t("termsLink")}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group hover:-translate-y-0.5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:shadow-accent/20 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("verifying")}
                </>
              ) : (
                <>
                  {t("submitButton")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="წესები და პირობები"
      >
        <div className="space-y-4">
          <section>
            <p>
              შესავალი:
              <br />
              წინამდებარე წესები და პირობები განსაზღვრავს „Property Exclusive
              2026"-ის ორგანიზატორის (Property Georgia) მიერ TwinO-ს AI
              ოპერაციული სისტემით (Master Dashboard) სარგებლობის წესებს.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              1. წვდომის არეალი (Master Dashboard)
            </h3>
            <p>
              როგორც ღონისძიების მთავარ ორგანიზატორს, გაძლევთ სრულ წვდომას
              Master Dashboard-ზე, სადაც გენერირდება ღონისძიებაში{" "}
              <span className="font-semibold text-primary">
                15-ვე მონაწილე დეველოპერის დაინტერესებული და დაკვალიფიცირებული
                ლიდების ერთიანი ბაზა.
              </span>
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              2. პერსონალურ მონაცემთა დაცვა (GDPR Compliance)
            </h3>
            <p>
              ვინაიდან თქვენ გაქვთ წვდომა ყველა მონაწილე კომპანიის{" "}
              <span className="font-semibold text-primary">
                კომერციულ ინტერესსა და ლიდებზე
              </span>
              , თქვენ იღებთ ვალდებულებას, დაიცვათ მკაცრი კონფიდენციალურობა.{" "}
              <span className="font-semibold text-primary">
                კატეგორიულად იკრძალება ერთი დეველოპერისადმი გამოხატული ინტერესის
                (ლიდის) მეორე დეველოპერისთვის გაზიარება ან მესამე პირებზე
                გასხვისება.
              </span>{" "}
              TwinO მოქმედებს მხოლოდ როგორც{" "}
              <span className="font-semibold text-primary">
                ტექნოლოგიური პროვაიდერი.
              </span>
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              3. სისტემის აქტიურობის ვადა და მონაცემთა ექსპორტი
            </h3>
            <p>
              უსაფრთხოების სტანდარტების დასაცავად, თქვენი Master Dashboard ღია
              და აქტიური იქნება{" "}
              <span className="font-semibold text-primary">
                ზუსტად 7 კალენდარული დღის
              </span>{" "}
              განმავლობაში ღონისძიების (26 აპრილი) დასრულებიდან. გთხოვთ, ამ
              7-დღიან ვადაში უზრუნველყოთ მონაცემების სრული ექსპორტი (Excel/CSV
              ფორმატში). მე-8 დღეს, ვებ-პორტალზე წვდომა და მასზე არსებული
              დროებითი მონაცემები ავტომატურად გაუქმდება.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              4. ინტელექტუალური საკუთრება
            </h3>
            <p>
              TwinO-ს AI აგენტები, ალგორითმები და Dashboard-ის ინტერფეისი
              წარმოადგენს TwinO-ს ექსკლუზიურ ინტელექტუალურ საკუთრებას.
            </p>
          </section>
        </div>
      </TermsModal>
    </div>
  );
}
