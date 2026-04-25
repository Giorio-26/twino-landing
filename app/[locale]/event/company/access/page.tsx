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

export default function CompanyAccessPage() {
  const t = useTranslations("dashboard.event.company.access");
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/event/verify-company-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, termsAccepted: true }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? t("genericError"));
        return;
      }

      router.push(`/${params.locale}/event/company`);
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
              წინამდებარე წესები და პირობები განსაზღვრავს დეველოპერის მიერ
              TwinO-ს AI ოპერაციული სისტემით გენერირებული ინდივიდუალური
              (დახურული) Dashboard-ით სარგებლობის წესებს ღონისძიება „Property
              Exclusive 2026"-ის ფარგლებში.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              1. იზოლირებული და შეზღუდული წვდომა
            </h3>
            <p>
              Access Key-ის გამოყენებით, თქვენ გეძლევათ წვდომა იზოლირებულ
              Dashboard-ზე, სადაც ნაჩვენებია მხოლოდ ლაივ-სტრიმიდან მიღებული ის
              ლიდები,{" "}
              <span className="font-semibold text-primary">
                რომლებიც TwinO-ს AI აგენტმა საუბრისას დააფიქსირა პირდაპირი
                თქვენს (და არა სხვა დეველოპერის) პროექტებზე.
              </span>
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              2. მონაცემთა დამუშავების მიზნობრიობა
            </h3>
            <p>
              სისტემაში ასახული ლიდების პერსონალური მონაცემები (ტელეფონის
              ნომერი, სახელი, ინტერესი) მოპოვებულია მომხმარებლის თანხმობით.
              თქვენ (დეველოპერი) იღებთ უფლებას, დაუკავშირდეთ აღნიშნულ ლიდებს{" "}
              <span className="font-semibold text-primary">
                მხოლოდ უძრავი ქონების გაყიდვების მიზნით. მკაცრად იკრძალება
                მოწოდებული ბაზის სხვა კომპანიებზე გასხვისება ან არა-მიზნობრივი
                სარეკლამო (სპამ) შეტყობინებებისთვის გამოყენება.
              </span>
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              3. სისტემის აქტიურობის 7-დღიანი ლიმიტი
            </h3>
            <p>
              მომხმარებელთა მონაცემების უსაფრთხოებიდან გამომდინარე, თქვენი
              პერსონალური Dashboard ხელმისაწვდომი იქნება{" "}
              <span className="font-semibold text-primary">
                მხოლოდ 7 კალენდარული დღის განმავლობაში.
              </span>{" "}
              გთხოვთ,{""}
              <span className="font-semibold text-primary">
                თქვენმა გაყიდვების გუნდმა ამ დროის განმავლობაში მოახდინოს
                ლიდების ექსპორტი (Excel/CSV ფორმატში) თქვენს შიდა TwinO დეშბორდ
                სისტემიდან.
              </span>{" "}
              7 დღის გასვლის შემდეგ,{" "}
              <span className="font-semibold text-primary">
                ბმული და წვდომის კოდი დეაქტივირდება.
              </span>
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              4. პასუხისმგებლობის გამიჯვნა
            </h3>
            <p>
              TwinO უზრუნველყოფს შემოსული ინტერესის მომენტალურ დამუშავებას,{" "}
              <span className="font-semibold text-primary">
                პროფაილინგს და ცხელი (Hot/Qualified) ლიდის მოწოდებას რეალურ
                დროში.
              </span>{" "}
              ლიდის საბოლოო კონვერსიაზე (გარიგების დახურვაზე) პასუხისმგებლობა
              სრულად ეკისრება{" "}
              <span className="font-semibold text-primary">
                დეველოპერის გაყიდვების გუნდს.
              </span>
            </p>
          </section>
          <section>
            <h3 className="mb-1.5 font-bold font-Helvetica-Neue text-primary text-sm">
              5. ⁠მონაცემთა საერთო ხელმისაწვდომობა (Master Access) და
              პასუხისმგებლობის გამიჯვნა
            </h3>
            <p>
              გთხოვთ გაითვალისწინოთ, რომ სისტემა ფუნქციონირებს ღონისძიების
              გენერალური ორგანიზატორის,{" "}
              <span className="font-semibold text-primary">
                Property Georgia-ს WhatsApp ნომერზე.
              </span>{" "}
              შესაბამისად, TwinO-ს (როგორც ტექნოლოგიური პროვაიდერის) არქიტექტურა
              ითვალისწინებს ე.წ. Master Dashboard-ს,
              <span className="font-semibold text-primary">
                {" "}
                რომელზეც Property Georgia-ს აქვს სრული წვდომა ღონისძიების
                ფარგლებში შემოსულ ყველა (მათ შორის, თქვენს პროექტებზე
                დაინტერესებულ) ლიდზე სტატისტიკური და საორგანიზაციო მიზნებისთვის.
              </span>
              <br />
              <br />
              TwinO იძლევა ტექნოლოგიურ გარანტიას, რომ თქვენი დახურული Dashboard{" "}
              <span className="font-semibold text-primary">
                იზოლირებულია სხვა დეველოპერებისგან
              </span>{" "}
              (მაგ: კომპანია 'A' ვერ ხედავს კომპანია 'B'-ს ლიდებს). თუმცა, TwinO
              არ იღებს პასუხისმგებლობას Property Georgia-ს მიერ Master
              Dashboard-დან მიღებული 
              <span className="font-semibold text-primary">{" "}
              მონაცემების შემდგომ გამოყენებაზე.
              </span>{" "}
              ორგანიზატორის მიერ მონაცემთა მართვა რეგულირდება უშუალოდ {" "}
              <span className="font-semibold text-primary">
              Property
              Georgia-სა და თქვენ (დეველოპერს) შორის არსებული პარტნიორობის
              ფარგლებში.
              </span>
            </p>
          </section>
        </div>
      </TermsModal>
    </div>
  );
}
