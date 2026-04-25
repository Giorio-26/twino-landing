"use client";

import { ChevronRight, FolderOpen, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
}

export default function CompanyDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/event/company/projects");
        if (!res.ok) throw new Error("Failed to load projects");
        const json = await res.json();
        setProjects(json.data ?? []);
      } catch {
        setError("Could not load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  function handleProjectClick(id: number) {
    router.push(`/${params.locale}/event/company/project/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
          Projects
        </h2>
        <p className="mt-1 text-dash-text-secondary text-sm">
          Select a project to view its collected leads.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-dash-border bg-dash-surface p-12 text-center text-dash-text-muted text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-dash-border bg-dash-surface"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dash-border bg-dash-surface p-12 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-dash-text-muted" />
          <p className="text-dash-text-muted text-sm">No projects found.</p>
        </div>
      ) : (
        <div className="dash-animate-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleProjectClick(project.id)}
              className="group hover:-translate-y-0.5 relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-dash-border bg-dash-surface p-5 text-left shadow-sm transition-all duration-300 hover:border-dash-accent/30 hover:shadow-dash-accent/5 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dash-accent/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dash-accent/15 to-dash-accent/5 transition-all duration-300 group-hover:from-dash-accent/25 group-hover:to-dash-accent/10 group-hover:shadow-dash-accent/20 group-hover:shadow-md">
                  <FolderOpen className="h-5 w-5 text-dash-accent" />
                </div>
                <div className="font-semibold text-dash-text text-sm leading-snug">
                  {project.name}
                </div>
              </div>
              <div className="relative ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dash-accent/5 transition-all duration-300 group-hover:bg-dash-accent">
                <ChevronRight className="h-3.5 w-3.5 text-dash-accent transition-colors duration-300 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
