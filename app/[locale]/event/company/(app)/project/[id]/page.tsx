"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import EventLeadsTable from "@/components/event/EventLeadsTable";

export default function CompanyProjectPage() {
  const params = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const projectId = Number(params.id);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.push(`/${params.locale}/event/company`)}
        className="flex items-center gap-1.5 text-dash-text-muted text-sm transition-colors hover:text-dash-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>

      <EventLeadsTable projectId={projectId} title="Project Leads" />
    </div>
  );
}
