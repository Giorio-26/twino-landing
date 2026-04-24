"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import EventLeadsTable from "@/components/event/EventLeadsTable";

export default function OrganizerCompanyPage() {
  const params = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const companyId = Number(params.id);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.push(`/${params.locale}/event/organizer`)}
        className="flex items-center gap-1.5 text-dash-text-muted text-sm transition-colors hover:text-dash-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </button>

      <EventLeadsTable companyId={companyId} title="Company Leads" />
    </div>
  );
}
