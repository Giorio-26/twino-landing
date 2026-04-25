"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import EventLeadsTable from "@/components/event/EventLeadsTable";

export default function OrganizerProjectLeadsPage() {
  const params = useParams<{ locale: string; id: string; projectId: string }>();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.push(`/${params.locale}/event/organizer/company/${params.id}`)}
        className="flex items-center gap-1.5 text-dash-text-muted text-sm transition-colors hover:text-dash-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>

      <EventLeadsTable
        fetchUrl={`/api/event/organizer/companies/${params.id}/projects/${params.projectId}/leads`}
        title="Project Leads"
      />
    </div>
  );
}
