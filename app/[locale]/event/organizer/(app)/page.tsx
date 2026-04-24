"use client";

import { Building2, ChevronRight, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Company {
  id: number;
  name: string;
}

export default function OrganizerOverviewPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const featuredCompany = companies.find(
    (company) =>
      company.name === "Property Georgia" || company.name === "Propery Georgia",
  );
  const otherCompanies = companies.filter(
    (company) =>
      company.name !== "Property Georgia" && company.name !== "Propery Georgia",
  );

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/event/companies");
        if (!res.ok) throw new Error("Failed to load companies");
        const json = await res.json();
        setCompanies(json.data ?? []);
      } catch {
        setError("Could not load companies. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  function handleCompanyClick(id: number) {
    router.push(`/${params.locale}/event/organizer/company/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Companies
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Click on a company to view their collected leads.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-dash-border bg-dash-surface p-12 text-center text-dash-text-muted text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-dash-border bg-dash-surface"
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-dash-border bg-dash-surface p-12 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-dash-text-muted" />
          <p className="text-dash-text-muted text-sm">
            No companies registered yet.
          </p>
        </div>
      ) : (
        <div className="dash-animate-in space-y-8">
          {featuredCompany && (
            <button
              type="button"
              onClick={() => handleCompanyClick(featuredCompany.id)}
              className="group hover:-translate-y-1 relative flex w-full items-center justify-between overflow-hidden rounded-3xl border border-dash-border bg-dash-surface p-6 text-left shadow-sm transition-all duration-500 hover:border-dash-accent/30 hover:shadow-dash-accent/5 hover:shadow-xl sm:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dash-accent/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-center gap-5 sm:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-dash-accent to-dash-accent/80 text-white shadow-dash-accent/25 shadow-lg transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 sm:h-20 sm:w-20">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="inline-flex shrink-0 items-center rounded-full bg-dash-accent/10 px-2.5 py-1 font-bold text-dash-accent text-xs uppercase tracking-widest">
                      Featured Partner
                    </span>
                  </div>
                  <div className="font-bold text-2xl text-dash-text tracking-tight sm:text-4xl">
                    {featuredCompany.name}
                  </div>
                </div>
              </div>
              <div className="relative ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dash-accent/5 transition-all duration-500 group-hover:bg-dash-accent sm:h-14 sm:w-14">
                <ChevronRight className="h-6 w-6 text-dash-accent transition-colors group-hover:text-white" />
              </div>
            </button>
          )}

          {otherCompanies.length > 0 && (
            <div>
              <h3 className="mb-4 font-semibold text-dash-text-secondary text-sm uppercase tracking-wider">
                Other Companies
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => handleCompanyClick(company.id)}
                    className="group hover:-translate-y-0.5 relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-dash-border bg-dash-surface p-5 text-left shadow-sm transition-all duration-300 hover:border-dash-accent/30 hover:shadow-dash-accent/5 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-dash-accent/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dash-accent/15 to-dash-accent/5 transition-all duration-300 group-hover:from-dash-accent/25 group-hover:to-dash-accent/10 group-hover:shadow-dash-accent/20 group-hover:shadow-md">
                        <Building2 className="h-5 w-5 text-dash-accent" />
                      </div>
                      <div className="font-semibold text-dash-text text-sm leading-snug">
                        {company.name}
                      </div>
                    </div>
                    <div className="relative ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dash-accent/5 transition-all duration-300 group-hover:bg-dash-accent">
                      <ChevronRight className="h-3.5 w-3.5 text-dash-accent transition-colors duration-300 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
